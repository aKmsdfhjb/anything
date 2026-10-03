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

// GET - list itinerary items for a trip
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
      SELECT 
        ii.*,
        up.username as added_by_username,
        up.profile_image as added_by_image
      FROM itinerary_items ii
      LEFT JOIN user_profiles up ON ii.user_id = up.user_id
      WHERE ii.trip_id = ${tripId}
      ORDER BY ii.day_number ASC, ii.sort_order ASC, ii.start_time ASC
    `;

    return Response.json({ items });
  } catch (err) {
    console.error("GET /api/itinerary error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST - add an itinerary item
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      trip_id,
      day_number,
      title,
      description,
      start_time,
      end_time,
      location_name,
      category,
      sort_order,
    } = body;

    if (!trip_id || day_number === undefined || !title) {
      return Response.json(
        { error: "Missing required fields: trip_id, day_number, title" },
        { status: 400 },
      );
    }

    const hasAccess = await canAccessTrip(trip_id, session.user.id);
    if (!hasAccess) {
      return Response.json({ error: "Access denied" }, { status: 403 });
    }

    const result = await sql`
      INSERT INTO itinerary_items (trip_id, user_id, day_number, title, description, start_time, end_time, location_name, category, sort_order)
      VALUES (
        ${trip_id}, 
        ${session.user.id}, 
        ${day_number}, 
        ${title}, 
        ${description || null}, 
        ${start_time || null}, 
        ${end_time || null}, 
        ${location_name || null}, 
        ${category || "activity"}, 
        ${sort_order || 0}
      )
      RETURNING *
    `;

    return Response.json({ item: result[0] }, { status: 201 });
  } catch (err) {
    console.error("POST /api/itinerary error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT - update an itinerary item
export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      title,
      description,
      start_time,
      end_time,
      location_name,
      category,
      day_number,
      sort_order,
    } = body;

    if (!id) {
      return Response.json({ error: "Missing item id" }, { status: 400 });
    }

    // Get the item to check trip access
    const existing =
      await sql`SELECT trip_id FROM itinerary_items WHERE id = ${id}`;
    if (existing.length === 0) {
      return Response.json({ error: "Item not found" }, { status: 404 });
    }

    const hasAccess = await canAccessTrip(existing[0].trip_id, session.user.id);
    if (!hasAccess) {
      return Response.json({ error: "Access denied" }, { status: 403 });
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (start_time !== undefined) {
      updates.push(`start_time = $${paramCount++}`);
      values.push(start_time);
    }
    if (end_time !== undefined) {
      updates.push(`end_time = $${paramCount++}`);
      values.push(end_time);
    }
    if (location_name !== undefined) {
      updates.push(`location_name = $${paramCount++}`);
      values.push(location_name);
    }
    if (category !== undefined) {
      updates.push(`category = $${paramCount++}`);
      values.push(category);
    }
    if (day_number !== undefined) {
      updates.push(`day_number = $${paramCount++}`);
      values.push(day_number);
    }
    if (sort_order !== undefined) {
      updates.push(`sort_order = $${paramCount++}`);
      values.push(sort_order);
    }

    if (updates.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(id);
    const result = await sql(
      `UPDATE itinerary_items SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`,
      values,
    );

    return Response.json({ item: result[0] });
  } catch (err) {
    console.error("PUT /api/itinerary error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE - remove an itinerary item
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

    // Get the item to check trip access
    const existing =
      await sql`SELECT trip_id FROM itinerary_items WHERE id = ${id}`;
    if (existing.length === 0) {
      return Response.json({ error: "Item not found" }, { status: 404 });
    }

    const hasAccess = await canAccessTrip(existing[0].trip_id, session.user.id);
    if (!hasAccess) {
      return Response.json({ error: "Access denied" }, { status: 403 });
    }

    await sql`DELETE FROM itinerary_items WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/itinerary error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
