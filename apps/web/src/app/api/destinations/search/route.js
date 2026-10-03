import sql from "@/app/api/utils/sql";

// Search destinations within a specific country, or create one if it doesn't exist
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country");
    const q = searchParams.get("q");

    // Global search — no country required
    if (!country && q && q.length >= 2) {
      const destinations = await sql`
        SELECT d.id, d.name, d.country, d.latitude, d.longitude, d.description, d.image_url,
               COUNT(t.id) as tip_count
        FROM destinations d
        LEFT JOIN tips t ON t.destination_id = d.id AND t.moderation_status = 'approved'
        WHERE LOWER(d.name) LIKE LOWER(${"%" + q + "%"})
           OR LOWER(d.country) LIKE LOWER(${"%" + q + "%"})
        GROUP BY d.id
        ORDER BY tip_count DESC, d.name ASC
        LIMIT 20
      `;
      return Response.json({ destinations });
    }

    if (!country) {
      return Response.json({ error: "country is required" }, { status: 400 });
    }

    // If no search query, return all destinations in this country
    if (!q || q.length < 1) {
      const destinations = await sql`
        SELECT d.id, d.name, d.country, d.latitude, d.longitude, d.description, d.image_url,
               COUNT(t.id) as tip_count
        FROM destinations d
        LEFT JOIN tips t ON t.destination_id = d.id AND t.moderation_status = 'approved'
        WHERE LOWER(d.country) = LOWER(${country})
        GROUP BY d.id
        ORDER BY tip_count DESC, d.name ASC
      `;
      return Response.json({ destinations });
    }

    // Search destinations matching the query within the country
    const destinations = await sql`
      SELECT d.id, d.name, d.country, d.latitude, d.longitude, d.description, d.image_url,
             COUNT(t.id) as tip_count
      FROM destinations d
      LEFT JOIN tips t ON t.destination_id = d.id AND t.moderation_status = 'approved'
      WHERE LOWER(d.country) = LOWER(${country})
        AND LOWER(d.name) LIKE LOWER(${"%" + q + "%"})
      GROUP BY d.id
      ORDER BY tip_count DESC, d.name ASC
    `;

    return Response.json({ destinations });
  } catch (err) {
    console.error("GET /api/destinations/search error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Create a new destination (for adding a place to a country)
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, country, latitude, longitude, description } = body;

    if (!name || !country) {
      return Response.json(
        { error: "name and country are required" },
        { status: 400 },
      );
    }

    // Check if destination already exists
    const existing = await sql`
      SELECT id, name, country FROM destinations
      WHERE LOWER(name) = LOWER(${name}) AND LOWER(country) = LOWER(${country})
      LIMIT 1
    `;

    if (existing.length > 0) {
      return Response.json({ destination: existing[0], existing: true });
    }

    // Create new destination
    const result = await sql`
      INSERT INTO destinations (name, country, latitude, longitude, description, destination_type)
      VALUES (${name}, ${country}, ${latitude || 0}, ${longitude || 0}, ${description || null}, 'city')
      RETURNING id, name, country, latitude, longitude, description
    `;

    return Response.json(
      { destination: result[0], existing: false },
      { status: 201 },
    );
  } catch (err) {
    console.error("POST /api/destinations/search error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
