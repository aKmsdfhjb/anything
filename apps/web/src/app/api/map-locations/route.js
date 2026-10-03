import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// GET /api/map-locations — search/list locations or find by place_id
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const place_id = searchParams.get("place_id");
    const q = searchParams.get("q");
    const bounds = searchParams.get("bounds"); // "swLat,swLng,neLat,neLng"

    if (place_id) {
      const rows = await sql`
        SELECT * FROM map_locations WHERE place_id = ${place_id} LIMIT 1
      `;
      return Response.json({ location: rows[0] || null });
    }

    if (bounds) {
      const [swLat, swLng, neLat, neLng] = bounds.split(",").map(Number);
      const rows = await sql`
        SELECT * FROM map_locations
        WHERE latitude BETWEEN ${swLat} AND ${neLat}
          AND longitude BETWEEN ${swLng} AND ${neLng}
        ORDER BY created_at DESC
        LIMIT 200
      `;
      return Response.json({ locations: rows });
    }

    if (q) {
      const rows = await sql`
        SELECT * FROM map_locations
        WHERE LOWER(name) LIKE LOWER(${"%" + q + "%"})
        ORDER BY name LIMIT 20
      `;
      return Response.json({ locations: rows });
    }

    const rows = await sql`
      SELECT * FROM map_locations ORDER BY created_at DESC LIMIT 200
    `;
    return Response.json({ locations: rows });
  } catch (err) {
    console.error("GET /api/map-locations error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/map-locations — find-or-create a location
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      address,
      latitude,
      longitude,
      category,
      place_id,
      image_url,
    } = body;

    if (!name || latitude == null || longitude == null) {
      return Response.json(
        { error: "name, latitude, longitude required" },
        { status: 400 },
      );
    }

    const validCategories = [
      "general",
      "food",
      "hotel",
      "beach",
      "attraction",
      "nightlife",
      "shopping",
      "transport",
      "gem",
    ];
    const cat = validCategories.includes(category) ? category : "general";

    // Deduplicate by place_id if provided
    if (place_id) {
      const existing = await sql`
        SELECT * FROM map_locations WHERE place_id = ${place_id} LIMIT 1
      `;
      if (existing.length > 0) {
        return Response.json({ location: existing[0], created: false });
      }
    } else {
      // Deduplicate by proximity (~30m radius: 0.0003 degrees ≈ 33m)
      const existing = await sql`
        SELECT * FROM map_locations
        WHERE ABS(latitude - ${parseFloat(latitude)}) < 0.0003
          AND ABS(longitude - ${parseFloat(longitude)}) < 0.0003
          AND LOWER(name) = LOWER(${name})
        LIMIT 1
      `;
      if (existing.length > 0) {
        return Response.json({ location: existing[0], created: false });
      }
    }

    const rows = await sql`
      INSERT INTO map_locations (name, address, latitude, longitude, category, place_id, image_url)
      VALUES (
        ${name},
        ${address || null},
        ${parseFloat(latitude)},
        ${parseFloat(longitude)},
        ${cat},
        ${place_id || null},
        ${image_url || null}
      )
      RETURNING *
    `;

    return Response.json({ location: rows[0], created: true });
  } catch (err) {
    console.error("POST /api/map-locations error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
