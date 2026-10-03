import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get shares for a trip
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get("trip_id");
    const shareCode = searchParams.get("share_code");

    if (shareCode) {
      // Get trip by share code
      const shares = await sql`
        SELECT ts.*, t.*, d.name as destination_name, d.country
        FROM trip_shares ts
        JOIN trips t ON ts.trip_id = t.id
        JOIN destinations d ON t.destination_id = d.id
        WHERE ts.share_code = ${shareCode}
      `;

      if (shares.length === 0) {
        return Response.json({ error: "Invalid share code" }, { status: 404 });
      }

      return Response.json({ trip: shares[0] });
    }

    if (!tripId) {
      return Response.json(
        { error: "Missing trip_id or share_code" },
        { status: 400 },
      );
    }

    const shares = await sql`
      SELECT * FROM trip_shares 
      WHERE trip_id = ${tripId} AND owner_id = ${session.user.id}
      ORDER BY created_at DESC
    `;

    return Response.json({ shares });
  } catch (err) {
    console.error("GET /api/trip-shares error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Create share link
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { trip_id, shared_with_email, permission_level } = body;

    if (!trip_id) {
      return Response.json({ error: "Missing trip_id" }, { status: 400 });
    }

    // Generate unique share code
    const shareCode =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    const result = await sql`
      INSERT INTO trip_shares (trip_id, owner_id, shared_with_email, permission_level, share_code)
      VALUES (${trip_id}, ${session.user.id}, ${shared_with_email || null}, ${permission_level || "view"}, ${shareCode})
      RETURNING *
    `;

    return Response.json({ share: result[0] }, { status: 201 });
  } catch (err) {
    console.error("POST /api/trip-shares error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Delete share
export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "Missing share id" }, { status: 400 });
    }

    await sql`
      DELETE FROM trip_shares
      WHERE id = ${id} AND owner_id = ${session.user.id}
    `;

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/trip-shares error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
