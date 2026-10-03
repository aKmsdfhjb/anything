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

// GET single trip by ID
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const hasAccess = await canAccessTrip(id, session.user.id);
    if (!hasAccess) {
      return Response.json({ error: "Access denied" }, { status: 403 });
    }

    const result = await sql`
      SELECT 
        t.id, t.trip_name, t.start_date, t.end_date, t.notes, t.status, t.created_at,
        t.user_id as owner_id, t.is_public, t.public_share_code, t.share_description,
        t.cover_image, t.description, t.custom_destination,
        d.id as destination_id,
        COALESCE(d.name, t.custom_destination) as destination_name,
        COALESCE(d.country, '') as country,
        d.image_url,
        (t.user_id = ${session.user.id}) as is_owner
      FROM trips t
      LEFT JOIN destinations d ON t.destination_id = d.id
      WHERE t.id = ${id}
    `;

    if (result.length === 0) {
      return Response.json({ error: "Trip not found" }, { status: 404 });
    }

    return Response.json({ trip: result[0] });
  } catch (err) {
    console.error("GET /api/trips/[id] error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE a trip by ID — only the owner can delete
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const result = await sql`
      DELETE FROM trips
      WHERE id = ${parseInt(id)} AND user_id = ${session.user.id}
      RETURNING id
    `;

    if (result.length === 0) {
      return Response.json(
        { error: "Trip not found or access denied" },
        { status: 404 },
      );
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/trips/[id] error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
