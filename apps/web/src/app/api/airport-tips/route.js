import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const destinationId = searchParams.get("destination_id");

    if (!destinationId) {
      return Response.json(
        { error: "destination_id is required" },
        { status: 400 },
      );
    }

    const tips = await sql`
      SELECT * FROM airport_tips
      WHERE destination_id = ${destinationId}
      ORDER BY created_at DESC
    `;

    return Response.json({ tips });
  } catch (error) {
    console.error("Error fetching airport tips:", error);
    return Response.json(
      { error: "Failed to fetch airport tips" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      destination_id,
      airport_code,
      terminal_walkthroughs,
      security_tips,
      lounge_access,
      transport_to_city,
    } = body;

    if (!destination_id || !airport_code) {
      return Response.json(
        { error: "destination_id and airport_code are required" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO airport_tips (
        destination_id,
        airport_code,
        terminal_walkthroughs,
        security_tips,
        lounge_access,
        transport_to_city
      )
      VALUES (
        ${destination_id},
        ${airport_code},
        ${terminal_walkthroughs || null},
        ${security_tips || null},
        ${lounge_access || null},
        ${transport_to_city || null}
      )
      RETURNING *
    `;

    return Response.json({ tip: result[0] });
  } catch (error) {
    console.error("Error creating airport tip:", error);
    return Response.json(
      { error: "Failed to create airport tip" },
      { status: 500 },
    );
  }
}
