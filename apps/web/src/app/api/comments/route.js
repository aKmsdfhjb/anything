import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get comments for a tip
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipId = searchParams.get("tip_id");

    if (!tipId) {
      return Response.json({ error: "Missing tip_id" }, { status: 400 });
    }

    // Only return approved comments to public
    const comments = await sql`
      SELECT 
        tc.*,
        up.username,
        up.profile_image,
        up.is_verified,
        up.reputation_score
      FROM tip_comments tc
      JOIN user_profiles up ON tc.user_id = up.user_id
      WHERE tc.tip_id = ${parseInt(tipId)}
        AND tc.approved = true
      ORDER BY tc.created_at ASC
    `;

    return Response.json({ comments });
  } catch (err) {
    console.error("GET /api/comments error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Post a comment
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tip_id, content } = body;

    if (!tip_id || !content?.trim()) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Create comment (not approved by default - requires moderation)
    const comment = await sql`
      INSERT INTO tip_comments (tip_id, user_id, content, approved)
      VALUES (${tip_id}, ${session.user.id}, ${content.trim()}, false)
      RETURNING *
    `;

    // Note: We don't update comment_count until approved

    // Get user info for the response
    const userInfo = await sql`
      SELECT username, profile_image, is_verified, reputation_score
      FROM user_profiles
      WHERE user_id = ${session.user.id}
    `;

    return Response.json(
      {
        comment: {
          ...comment[0],
          ...userInfo[0],
        },
        message: "Comment submitted for moderation",
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("POST /api/comments error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Delete a comment
export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("comment_id");

    if (!commentId) {
      return Response.json({ error: "Missing comment_id" }, { status: 400 });
    }

    // Get comment to verify ownership and get tip_id
    const comment = await sql`
      SELECT user_id, tip_id FROM tip_comments WHERE id = ${parseInt(commentId)}
    `;

    if (comment.length === 0) {
      return Response.json({ error: "Comment not found" }, { status: 404 });
    }

    if (comment[0].user_id !== session.user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete comment
    await sql`
      DELETE FROM tip_comments WHERE id = ${parseInt(commentId)}
    `;

    // Update tip comment count
    await sql`
      UPDATE tips
      SET comment_count = GREATEST(comment_count - 1, 0)
      WHERE id = ${comment[0].tip_id}
    `;

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/comments error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
