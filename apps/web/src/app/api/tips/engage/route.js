import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tip_id, engagement_type } = body; // upvote, view, share, bookmark

    if (!tip_id || !engagement_type) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Record engagement
    await sql`
      INSERT INTO tip_engagements (tip_id, user_id, engagement_type)
      VALUES (${tip_id}, ${session.user.id}, ${engagement_type})
      ON CONFLICT (tip_id, user_id, engagement_type) DO NOTHING
    `;

    // Update tip counters
    if (engagement_type === "upvote") {
      await sql`
        UPDATE tips
        SET upvotes = upvotes + 1,
            engagement_score = engagement_score + 10
        WHERE id = ${tip_id}
      `;

      // Award reputation to tip author
      const tip = await sql`SELECT user_id FROM tips WHERE id = ${tip_id}`;
      if (tip.length > 0) {
        await sql`
          UPDATE user_profiles
          SET reputation_score = reputation_score + 5
          WHERE user_id = ${tip[0].user_id}
        `;
      }
    } else if (engagement_type === "view") {
      await sql`
        UPDATE tips
        SET views = views + 1,
            engagement_score = engagement_score + 1
        WHERE id = ${tip_id}
      `;
    } else if (engagement_type === "share") {
      await sql`
        UPDATE tips
        SET engagement_score = engagement_score + 15
        WHERE id = ${tip_id}
      `;
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("POST /api/tips/engage error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
