import sql from "@/app/api/utils/sql";

// Get sponsored content for a destination
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const destinationId = searchParams.get("destination_id");

    let sponsored;
    if (destinationId) {
      sponsored = await sql`
        SELECT *
        FROM sponsored_content
        WHERE destination_id = ${destinationId} 
        AND is_active = true
        AND (expires_at IS NULL OR expires_at > NOW())
        ORDER BY priority DESC, created_at DESC
        LIMIT 10
      `;
    } else {
      sponsored = await sql`
        SELECT *
        FROM sponsored_content
        WHERE is_active = true
        AND (expires_at IS NULL OR expires_at > NOW())
        ORDER BY priority DESC, created_at DESC
        LIMIT 20
      `;
    }

    return Response.json({ sponsored });
  } catch (err) {
    console.error("GET /api/sponsored error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Create sponsored content (for advertisers)
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      destination_id,
      advertiser_name,
      title,
      description,
      image_url,
      booking_url,
      commission_rate,
      priority,
      expires_at,
    } = body;

    if (!advertiser_name || !title || !booking_url) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO sponsored_content (
        destination_id, 
        advertiser_name, 
        title, 
        description, 
        image_url, 
        booking_url, 
        commission_rate,
        priority,
        expires_at
      )
      VALUES (
        ${destination_id || null}, 
        ${advertiser_name}, 
        ${title}, 
        ${description || null}, 
        ${image_url || null}, 
        ${booking_url}, 
        ${commission_rate || 10.0},
        ${priority || 0},
        ${expires_at || null}
      )
      RETURNING *
    `;

    return Response.json({ sponsored: result[0] }, { status: 201 });
  } catch (err) {
    console.error("POST /api/sponsored error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
