import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Award "Been Here" badge when user posts a tip with photo/location
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { destination_id } = body;

    if (!destination_id) {
      return Response.json(
        { error: "Missing destination_id" },
        { status: 400 },
      );
    }

    // Get the "Visited" badge
    const badgeResult = await sql`
      SELECT id FROM badges WHERE name = 'Visited' LIMIT 1
    `;

    if (badgeResult.length === 0) {
      return Response.json({ error: "Badge not found" }, { status: 404 });
    }

    const badgeId = badgeResult[0].id;

    // Award the badge
    const result = await sql`
      INSERT INTO user_badges (user_id, badge_id, destination_id)
      VALUES (${session.user.id}, ${badgeId}, ${destination_id})
      ON CONFLICT (user_id, badge_id, destination_id) DO NOTHING
      RETURNING *
    `;

    // Check for achievement badges based on visited count
    const visitedCount = await sql`
      SELECT COUNT(DISTINCT destination_id) as count
      FROM user_badges
      WHERE user_id = ${session.user.id} AND badge_id = ${badgeId}
    `;

    const count = visitedCount[0]?.count || 0;

    // Award Explorer badge (5+ destinations)
    if (count >= 5) {
      await sql`
        INSERT INTO user_badges (user_id, badge_id, destination_id)
        SELECT ${session.user.id}, id, NULL
        FROM badges WHERE name = 'Explorer'
        ON CONFLICT DO NOTHING
      `;
    }

    // Award Globetrotter badge (20+ destinations)
    if (count >= 20) {
      await sql`
        INSERT INTO user_badges (user_id, badge_id, destination_id)
        SELECT ${session.user.id}, id, NULL
        FROM badges WHERE name = 'Globetrotter'
        ON CONFLICT DO NOTHING
      `;
    }

    return Response.json(
      { badge: result[0], visited_count: count },
      { status: 201 },
    );
  } catch (err) {
    console.error("POST /api/verification error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Get user's badges
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return Response.json({ error: "Missing user_id" }, { status: 400 });
    }

    const badges = await sql`
      SELECT 
        b.id,
        b.name,
        b.description,
        b.icon,
        b.badge_type,
        ub.earned_at,
        d.name as destination_name
      FROM user_badges ub
      JOIN badges b ON ub.badge_id = b.id
      LEFT JOIN destinations d ON ub.destination_id = d.id
      WHERE ub.user_id = ${userId}
      ORDER BY ub.earned_at DESC
    `;

    return Response.json({ badges });
  } catch (err) {
    console.error("GET /api/verification error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
