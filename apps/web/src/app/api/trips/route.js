import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get user's trips (owned + collaborative)
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Get user's own trips (LEFT JOIN so custom_destination trips work)
    let ownTrips;
    if (status) {
      ownTrips = await sql`
        SELECT 
          t.id, t.trip_name, t.start_date, t.end_date, t.notes, t.status, t.created_at,
          t.user_id as owner_id, t.is_public, t.public_share_code, t.share_description,
          t.cover_image, t.description, t.custom_destination,
          d.id as destination_id,
          COALESCE(d.name, t.custom_destination) as destination_name,
          COALESCE(d.country, '') as country,
          d.image_url,
          FALSE as is_collaborator,
          NULL as owner_username,
          NULL as owner_image
        FROM trips t
        LEFT JOIN destinations d ON t.destination_id = d.id
        WHERE t.user_id = ${session.user.id} AND t.status = ${status}
      `;
    } else {
      ownTrips = await sql`
        SELECT 
          t.id, t.trip_name, t.start_date, t.end_date, t.notes, t.status, t.created_at,
          t.user_id as owner_id, t.is_public, t.public_share_code, t.share_description,
          t.cover_image, t.description, t.custom_destination,
          d.id as destination_id,
          COALESCE(d.name, t.custom_destination) as destination_name,
          COALESCE(d.country, '') as country,
          d.image_url,
          FALSE as is_collaborator,
          NULL as owner_username,
          NULL as owner_image
        FROM trips t
        LEFT JOIN destinations d ON t.destination_id = d.id
        WHERE t.user_id = ${session.user.id}
      `;
    }

    // Get collaborative trips (where user has been accepted)
    let collabTrips;
    if (status) {
      collabTrips = await sql`
        SELECT 
          t.id, t.trip_name, t.start_date, t.end_date, t.notes, t.status, t.created_at,
          t.user_id as owner_id, t.is_public, t.public_share_code, t.share_description,
          t.cover_image, t.description, t.custom_destination,
          d.id as destination_id,
          COALESCE(d.name, t.custom_destination) as destination_name,
          COALESCE(d.country, '') as country,
          d.image_url,
          TRUE as is_collaborator,
          up.username as owner_username,
          up.profile_image as owner_image
        FROM trip_collaborators tc
        JOIN trips t ON tc.trip_id = t.id
        LEFT JOIN destinations d ON t.destination_id = d.id
        LEFT JOIN user_profiles up ON t.user_id = up.user_id
        WHERE tc.user_id = ${session.user.id} AND tc.status = 'accepted' AND t.status = ${status}
      `;
    } else {
      collabTrips = await sql`
        SELECT 
          t.id, t.trip_name, t.start_date, t.end_date, t.notes, t.status, t.created_at,
          t.user_id as owner_id, t.is_public, t.public_share_code, t.share_description,
          t.cover_image, t.description, t.custom_destination,
          d.id as destination_id,
          COALESCE(d.name, t.custom_destination) as destination_name,
          COALESCE(d.country, '') as country,
          d.image_url,
          TRUE as is_collaborator,
          up.username as owner_username,
          up.profile_image as owner_image
        FROM trip_collaborators tc
        JOIN trips t ON tc.trip_id = t.id
        LEFT JOIN destinations d ON t.destination_id = d.id
        LEFT JOIN user_profiles up ON t.user_id = up.user_id
        WHERE tc.user_id = ${session.user.id} AND tc.status = 'accepted'
      `;
    }

    const trips = [...ownTrips, ...collabTrips].sort(
      (a, b) => new Date(a.start_date) - new Date(b.start_date),
    );

    return Response.json({ trips });
  } catch (err) {
    console.error("GET /api/trips error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Create a trip
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      destination_id,
      custom_destination,
      trip_name,
      start_date,
      end_date,
      notes,
      status,
      cover_image,
      description,
    } = body;

    if (!trip_name || !start_date) {
      return Response.json(
        { error: "Missing required fields: trip_name, start_date" },
        { status: 400 },
      );
    }

    if (!destination_id && !custom_destination) {
      return Response.json(
        { error: "Provide either destination_id or custom_destination" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO trips (
        user_id, destination_id, custom_destination, trip_name, start_date, end_date,
        notes, status, cover_image, description
      )
      VALUES (
        ${session.user.id},
        ${destination_id ? parseInt(destination_id) : null},
        ${custom_destination || null},
        ${trip_name},
        ${start_date},
        ${end_date || null},
        ${notes || null},
        ${status || "planned"},
        ${cover_image || null},
        ${description || null}
      )
      RETURNING *
    `;

    return Response.json({ trip: result[0] }, { status: 201 });
  } catch (err) {
    console.error("POST /api/trips error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Update a trip
export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      trip_name,
      start_date,
      end_date,
      notes,
      status,
      cover_image,
      description,
      custom_destination,
    } = body;

    if (!id) {
      return Response.json({ error: "Missing trip id" }, { status: 400 });
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (trip_name !== undefined) {
      updates.push(`trip_name = $${paramCount++}`);
      values.push(trip_name);
    }
    if (start_date !== undefined) {
      updates.push(`start_date = $${paramCount++}`);
      values.push(start_date);
    }
    if (end_date !== undefined) {
      updates.push(`end_date = $${paramCount++}`);
      values.push(end_date);
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      values.push(notes);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (cover_image !== undefined) {
      updates.push(`cover_image = $${paramCount++}`);
      values.push(cover_image);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (custom_destination !== undefined) {
      updates.push(`custom_destination = $${paramCount++}`);
      values.push(custom_destination);
    }

    if (updates.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(id);
    values.push(session.user.id);

    const result = await sql(
      `UPDATE trips SET ${updates.join(", ")} WHERE id = $${paramCount++} AND user_id = $${paramCount} RETURNING *`,
      values,
    );

    if (result.length === 0) {
      return Response.json({ error: "Trip not found" }, { status: 404 });
    }

    return Response.json({ trip: result[0] });
  } catch (err) {
    console.error("PUT /api/trips error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Delete a trip
export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "Missing trip id" }, { status: 400 });
    }

    await sql`
      DELETE FROM trips
      WHERE id = ${id} AND user_id = ${session.user.id}
    `;

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/trips error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
