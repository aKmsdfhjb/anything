import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get tips pending moderation (admin only)
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin (verified users can moderate)
    const userProfile = await sql`
      SELECT is_verified FROM user_profiles WHERE user_id = ${session.user.id}
    `;

    if (!userProfile[0]?.is_verified) {
      return Response.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    let query = "";
    let params = [];

    if (status === "pending") {
      query = `
        SELECT 
          t.*,
          up.username,
          up.profile_image,
          up.is_verified as user_verified,
          up.reputation_score,
          d.name as destination_name,
          d.country as destination_country
        FROM tips t
        JOIN user_profiles up ON t.user_id = up.user_id
        JOIN destinations d ON t.destination_id = d.id
        WHERE t.moderation_status = 'pending'
        ORDER BY t.created_at ASC
      `;
    } else if (status === "approved") {
      query = `
        SELECT 
          t.*,
          up.username,
          up.profile_image,
          up.is_verified as user_verified,
          d.name as destination_name,
          d.country as destination_country
        FROM tips t
        JOIN user_profiles up ON t.user_id = up.user_id
        JOIN destinations d ON t.destination_id = d.id
        WHERE t.moderation_status = 'approved'
        ORDER BY t.moderated_at DESC
        LIMIT 100
      `;
    } else if (status === "rejected") {
      query = `
        SELECT 
          t.*,
          up.username,
          up.profile_image,
          up.is_verified as user_verified,
          d.name as destination_name,
          d.country as destination_country
        FROM tips t
        JOIN user_profiles up ON t.user_id = up.user_id
        JOIN destinations d ON t.destination_id = d.id
        WHERE t.moderation_status = 'rejected'
        ORDER BY t.moderated_at DESC
        LIMIT 100
      `;
    }

    const tips = await sql(query, params);

    // Get counts for all statuses
    const counts = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE moderation_status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE moderation_status = 'approved') as approved_count,
        COUNT(*) FILTER (WHERE moderation_status = 'rejected') as rejected_count
      FROM tips
    `;

    return Response.json({
      tips,
      counts: counts[0] || {
        pending_count: 0,
        approved_count: 0,
        rejected_count: 0,
      },
    });
  } catch (err) {
    console.error("GET /api/moderation/tips error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Approve or reject a tip
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    const { tip_id, action, note } = body;

    if (!tip_id || !action) {
      return Response.json(
        { error: "Missing required fields (tip_id, action)" },
        { status: 400 },
      );
    }

    if (action !== "approve" && action !== "reject") {
      return Response.json(
        { error: "Action must be 'approve' or 'reject'" },
        { status: 400 },
      );
    }

    const newStatus = action === "approve" ? "approved" : "rejected";

    const result = await sql`
      UPDATE tips
      SET 
        moderation_status = ${newStatus},
        moderated_at = NOW(),
        moderated_by = ${session.user.id},
        moderation_note = ${note || null}
      WHERE id = ${tip_id}
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json({ error: "Tip not found" }, { status: 404 });
    }

    // If approved, update the user's reputation
    if (action === "approve") {
      await sql`
        UPDATE user_profiles
        SET reputation_score = reputation_score + 5,
            total_reviews = total_reviews + 1
        WHERE user_id = ${result[0].user_id}
      `;
    }

    return Response.json({
      success: true,
      action: newStatus,
      tip: result[0],
    });
  } catch (err) {
    console.error("POST /api/moderation/tips error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
