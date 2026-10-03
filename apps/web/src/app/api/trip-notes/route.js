import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Helper: check if user is trip owner or accepted collaborator
async function canAccessTrip(tripId, userId) {
  const result = await sql`
    SELECT 1 FROM trips WHERE id = ${tripId} AND user_id = ${userId}
    UNION
    SELECT 1 FROM trip_collaborators WHERE trip_id = ${tripId} AND user_id = ${userId} AND status = 'accepted'
  `;
  return result.length > 0;
}

// GET - list notes for a trip
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get("trip_id");

    if (!tripId) {
      return Response.json({ error: "Missing trip_id" }, { status: 400 });
    }

    const hasAccess = await canAccessTrip(tripId, session.user.id);
    if (!hasAccess) {
      return Response.json({ error: "Access denied" }, { status: 403 });
    }

    const notes = await sql`
      SELECT tn.*, up.username as added_by_username, up.profile_image as added_by_image
      FROM trip_notes tn
      LEFT JOIN user_profiles up ON tn.user_id = up.user_id
      WHERE tn.trip_id = ${tripId}
      ORDER BY tn.created_at DESC
    `;

    return Response.json({ notes });
  } catch (err) {
    console.error("GET /api/trip-notes error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST - add a note
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { trip_id, content } = body;

    if (!trip_id || !content?.trim()) {
      return Response.json(
        { error: "Missing trip_id or content" },
        { status: 400 },
      );
    }

    const hasAccess = await canAccessTrip(trip_id, session.user.id);
    if (!hasAccess) {
      return Response.json({ error: "Access denied" }, { status: 403 });
    }

    const result = await sql`
      INSERT INTO trip_notes (trip_id, user_id, content)
      VALUES (${trip_id}, ${session.user.id}, ${content.trim()})
      RETURNING *
    `;

    // Fetch with username
    const note = await sql`
      SELECT tn.*, up.username as added_by_username, up.profile_image as added_by_image
      FROM trip_notes tn
      LEFT JOIN user_profiles up ON tn.user_id = up.user_id
      WHERE tn.id = ${result[0].id}
    `;

    return Response.json({ note: note[0] }, { status: 201 });
  } catch (err) {
    console.error("POST /api/trip-notes error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT - edit a note (only own notes)
export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, content } = body;

    if (!id || !content?.trim()) {
      return Response.json({ error: "Missing id or content" }, { status: 400 });
    }

    const result = await sql`
      UPDATE trip_notes 
      SET content = ${content.trim()}, updated_at = NOW()
      WHERE id = ${id} AND user_id = ${session.user.id}
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json({ error: "Note not found" }, { status: 404 });
    }

    return Response.json({ note: result[0] });
  } catch (err) {
    console.error("PUT /api/trip-notes error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE - remove a note (only own notes)
export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "Missing note id" }, { status: 400 });
    }

    await sql`DELETE FROM trip_notes WHERE id = ${id} AND user_id = ${session.user.id}`;
    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/trip-notes error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
