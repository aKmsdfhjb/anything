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

// Get packing items for a trip
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

    const items = await sql`
      SELECT pi.*, up.username as added_by_username
      FROM packing_items pi
      LEFT JOIN user_profiles up ON pi.user_id = up.user_id
      WHERE pi.trip_id = ${tripId}
      ORDER BY pi.category, pi.item_name
    `;

    return Response.json({ items });
  } catch (err) {
    console.error("GET /api/packing-list error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Add packing item
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { trip_id, item_name, category, quantity, notes } = body;

    if (!trip_id || !item_name || !category) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const hasAccess = await canAccessTrip(trip_id, session.user.id);
    if (!hasAccess) {
      return Response.json({ error: "Access denied" }, { status: 403 });
    }

    const result = await sql`
      INSERT INTO packing_items (trip_id, user_id, item_name, category, quantity, notes)
      VALUES (${trip_id}, ${session.user.id}, ${item_name}, ${category}, ${quantity || 1}, ${notes || null})
      RETURNING *
    `;

    return Response.json({ item: result[0] }, { status: 201 });
  } catch (err) {
    console.error("POST /api/packing-list error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Update packing item
export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, is_packed, item_name, quantity, notes } = body;

    if (!id) {
      return Response.json({ error: "Missing item id" }, { status: 400 });
    }

    // Check that user has access to the trip this item belongs to
    const existing =
      await sql`SELECT trip_id FROM packing_items WHERE id = ${id}`;
    if (existing.length === 0) {
      return Response.json({ error: "Item not found" }, { status: 404 });
    }

    const hasAccess = await canAccessTrip(existing[0].trip_id, session.user.id);
    if (!hasAccess) {
      return Response.json({ error: "Access denied" }, { status: 403 });
    }

    let query = "UPDATE packing_items SET ";
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (is_packed !== undefined) {
      updates.push(`is_packed = $${paramCount}`);
      values.push(is_packed);
      paramCount++;
    }
    if (item_name) {
      updates.push(`item_name = $${paramCount}`);
      values.push(item_name);
      paramCount++;
    }
    if (quantity !== undefined) {
      updates.push(`quantity = $${paramCount}`);
      values.push(quantity);
      paramCount++;
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount}`);
      values.push(notes);
      paramCount++;
    }

    if (updates.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    query += updates.join(", ");
    query += ` WHERE id = $${paramCount} RETURNING *`;
    values.push(id);

    const result = await sql(query, values);

    return Response.json({ item: result[0] });
  } catch (err) {
    console.error("PUT /api/packing-list error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Delete packing item
export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "Missing item id" }, { status: 400 });
    }

    // Check that user has access to the trip this item belongs to
    const existing =
      await sql`SELECT trip_id FROM packing_items WHERE id = ${id}`;
    if (existing.length === 0) {
      return Response.json({ error: "Item not found" }, { status: 404 });
    }

    const hasAccess = await canAccessTrip(existing[0].trip_id, session.user.id);
    if (!hasAccess) {
      return Response.json({ error: "Access denied" }, { status: 403 });
    }

    await sql`DELETE FROM packing_items WHERE id = ${id}`;

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/packing-list error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
