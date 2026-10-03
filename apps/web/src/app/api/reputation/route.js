import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Update reputation score (upvote/downvote a tip or user)
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { target_user_id, points, action } = body; // action: 'upvote' or 'downvote'

    if (!target_user_id || points === undefined) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Update reputation score
    const pointsToAdd =
      action === "downvote" ? -Math.abs(points) : Math.abs(points);

    const result = await sql`
      UPDATE user_profiles
      SET 
        reputation_score = GREATEST(0, reputation_score + ${pointsToAdd}),
        total_reviews = total_reviews + 1
      WHERE user_id = ${target_user_id}
      RETURNING reputation_score, total_reviews
    `;

    if (result.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const newScore = result[0].reputation_score;

    // Check for reputation badges
    if (newScore >= 50) {
      await sql`
        INSERT INTO user_badges (user_id, badge_id, destination_id)
        SELECT ${target_user_id}, id, NULL
        FROM badges WHERE name = 'Local Expert'
        ON CONFLICT DO NOTHING
      `;
    }

    if (newScore >= 100) {
      await sql`
        INSERT INTO user_badges (user_id, badge_id, destination_id)
        SELECT ${target_user_id}, id, NULL
        FROM badges WHERE name = 'Trusted Traveler'
        ON CONFLICT DO NOTHING
      `;
    }

    return Response.json({
      reputation_score: result[0].reputation_score,
      total_reviews: result[0].total_reviews,
    });
  } catch (err) {
    console.error("POST /api/reputation error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Get reputation score
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return Response.json({ error: "Missing user_id" }, { status: 400 });
    }

    const result = await sql`
      SELECT reputation_score, total_reviews, is_verified
      FROM user_profiles
      WHERE user_id = ${userId}
    `;

    if (result.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (err) {
    console.error("GET /api/reputation error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
