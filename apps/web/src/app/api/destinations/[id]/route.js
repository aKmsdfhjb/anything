import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const destinations = await sql`
      SELECT * FROM destinations
      WHERE id = ${id}
      LIMIT 1
    `;

    if (destinations.length === 0) {
      return Response.json({ error: "Destination not found" }, { status: 404 });
    }

    return Response.json({ destination: destinations[0] });
  } catch (error) {
    console.error("Error fetching destination:", error);
    return Response.json(
      { error: "Failed to fetch destination" },
      { status: 500 },
    );
  }
}
