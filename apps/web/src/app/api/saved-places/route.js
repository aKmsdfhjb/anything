import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get saved places
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const places = await sql`
      SELECT 
        sp.id,
        sp.notes,
        sp.created_at,
        d.id as destination_id,
        d.name,
        d.country,
        d.latitude,
        d.longitude,
        d.description,
        d.image_url
      FROM saved_places sp
      JOIN destinations d ON sp.destination_id = d.id
      WHERE sp.user_id = ${session.user.id}
      ORDER BY sp.created_at DESC
    `;

    return Response.json({ places });
  } catch (err) {
    console.error("GET /api/saved-places error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Save a place
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { destination_id, notes } = body;

    if (!destination_id) {
      return Response.json(
        { error: "Missing destination_id" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO saved_places (user_id, destination_id, notes)
      VALUES (${session.user.id}, ${destination_id}, ${notes || null})
      ON CONFLICT (user_id, destination_id) DO UPDATE SET notes = ${notes || null}
      RETURNING *
    `;

    return Response.json({ place: result[0] }, { status: 201 });
  } catch (err) {
    console.error("POST /api/saved-places error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Remove saved place
export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const destination_id = searchParams.get("destination_id");

    if (!destination_id) {
      return Response.json(
        { error: "Missing destination_id" },
        { status: 400 },
      );
    }

    await sql`
      DELETE FROM saved_places
      WHERE user_id = ${session.user.id} AND destination_id = ${destination_id}
    `;

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/saved-places error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
