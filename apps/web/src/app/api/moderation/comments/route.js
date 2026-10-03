import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get pending comments (admin only)
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin (you can add admin field to user_profiles)
    const userProfile = await sql`
      SELECT is_verified FROM user_profiles WHERE user_id = ${session.user.id}
    `;

    // For now, only verified users can moderate
    // TODO: Add proper admin role
    if (!userProfile[0]?.is_verified) {
      return Response.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const query =
      status === "pending"
        ? sql`
          SELECT 
            tc.*,
            up.username,
            up.profile_image,
            t.title as tip_title
          FROM tip_comments tc
          JOIN user_profiles up ON tc.user_id = up.user_id
          JOIN tips t ON tc.tip_id = t.id
          WHERE tc.approved = false
          ORDER BY tc.created_at DESC
        `
        : sql`
          SELECT 
            tc.*,
            up.username,
            up.profile_image,
            t.title as tip_title
          FROM tip_comments tc
          JOIN user_profiles up ON tc.user_id = up.user_id
          JOIN tips t ON tc.tip_id = t.id
          WHERE tc.approved = true
          ORDER BY tc.moderated_at DESC
          LIMIT 100
        `;

    const comments = await query;

    return Response.json({ comments });
  } catch (err) {
    console.error("GET /api/moderation/comments error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Approve or reject a comment
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const userProfile = await sql`
      SELECT is_verified FROM user_profiles WHERE user_id = ${session.user.id}
    `;

    if (!userProfile[0]?.is_verified) {
      return Response.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { comment_id, action, note } = body; // action: 'approve' or 'reject'

    if (!comment_id || !action) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (action === "approve") {
      // Approve comment
      const result = await sql`
        UPDATE tip_comments
        SET 
          approved = true,
          moderated_at = NOW(),
          moderated_by = ${session.user.id},
          moderation_note = ${note || null}
        WHERE id = ${comment_id}
        RETURNING tip_id
      `;

      if (result.length === 0) {
        return Response.json({ error: "Comment not found" }, { status: 404 });
      }

      // Update tip comment count
      await sql`
        UPDATE tips
        SET comment_count = comment_count + 1
        WHERE id = ${result[0].tip_id}
      `;

      return Response.json({ success: true, action: "approved" });
    } else if (action === "reject") {
      // Delete rejected comment
      const result = await sql`
        DELETE FROM tip_comments
        WHERE id = ${comment_id}
        RETURNING tip_id
      `;

      if (result.length === 0) {
        return Response.json({ error: "Comment not found" }, { status: 404 });
      }

      return Response.json({ success: true, action: "rejected" });
    } else {
      return Response.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (err) {
    console.error("POST /api/moderation/comments error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
