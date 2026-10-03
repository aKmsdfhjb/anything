import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const destinations = await sql`
      SELECT id, name, country, latitude, longitude, description, image_url, created_at
      FROM destinations
      ORDER BY name ASC
    `;

    return Response.json({ destinations });
  } catch (err) {
    console.error("GET /api/destinations error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
