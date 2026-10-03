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
      SELECT * FROM cruise_tips
      WHERE destination_id = ${destinationId}
      ORDER BY created_at DESC
    `;

    return Response.json({ tips });
  } catch (error) {
    console.error("Error fetching cruise tips:", error);
    return Response.json(
      { error: "Failed to fetch cruise tips" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      destination_id,
      cruise_line,
      boarding_tips,
      disembarkation_tips,
      cabin_card_info,
      port_walkthrough,
    } = body;

    if (!destination_id) {
      return Response.json(
        { error: "destination_id is required" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO cruise_tips (
        destination_id,
        cruise_line,
        boarding_tips,
        disembarkation_tips,
        cabin_card_info,
        port_walkthrough
      )
      VALUES (
        ${destination_id},
        ${cruise_line || null},
        ${boarding_tips || null},
        ${disembarkation_tips || null},
        ${cabin_card_info || null},
        ${port_walkthrough || null}
      )
      RETURNING *
    `;

    return Response.json({ tip: result[0] });
  } catch (error) {
    console.error("Error creating cruise tip:", error);
    return Response.json(
      { error: "Failed to create cruise tip" },
      { status: 500 },
    );
  }
}
