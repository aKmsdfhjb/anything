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

// Get documents for a trip
// Private docs are only visible to their uploader
// Shared docs are visible to all authorized trip members
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

    // Verify user has access (owner or collaborator)
    const hasAccess = await canAccessTrip(tripId, session.user.id);
    if (!hasAccess) {
      return Response.json({ error: "Access denied" }, { status: 403 });
    }

    // Return shared docs for everyone + own private docs
    const documents = await sql`
      SELECT td.*, up.username as added_by_username, up.profile_image as added_by_image
      FROM trip_documents td
      LEFT JOIN user_profiles up ON td.user_id = up.user_id
      WHERE td.trip_id = ${tripId}
        AND (
          td.is_private = false
          OR td.is_private IS NULL
          OR td.user_id = ${session.user.id}
        )
      ORDER BY td.created_at DESC
    `;

    return Response.json({ documents });
  } catch (err) {
    console.error("GET /api/trip-documents error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Add a document
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      trip_id,
      document_type,
      title,
      file_url,
      file_type,
      file_size,
      notes,
      is_private,
    } = body;

    if (!trip_id || !document_type || !title || !file_url || !file_type) {
      return Response.json(
        {
          error:
            "Missing required fields: trip_id, document_type, title, file_url, file_type",
        },
        { status: 400 },
      );
    }

    // Verify user has access (owner or collaborator)
    const hasAccess = await canAccessTrip(trip_id, session.user.id);
    if (!hasAccess) {
      return Response.json({ error: "Access denied" }, { status: 403 });
    }

    const result = await sql`
      INSERT INTO trip_documents (trip_id, user_id, document_type, title, file_url, file_type, file_size, notes, is_private)
      VALUES (
        ${trip_id}, ${session.user.id}, ${document_type}, ${title},
        ${file_url}, ${file_type}, ${file_size || null}, ${notes || null},
        ${is_private === true}
      )
      RETURNING *
    `;

    return Response.json({ document: result[0] }, { status: 201 });
  } catch (err) {
    console.error("POST /api/trip-documents error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Delete a document (only own documents)
export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "Missing document id" }, { status: 400 });
    }

    await sql`
      DELETE FROM trip_documents
      WHERE id = ${id} AND user_id = ${session.user.id}
    `;

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/trip-documents error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
