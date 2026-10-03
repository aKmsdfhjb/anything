import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// GDPR Data Deletion Request - Right to Be Forgotten
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { type = "full_deletion", reason } = body;

    // Check if there's already a pending request
    const existingRequest = await sql`
      SELECT * FROM data_deletion_requests
      WHERE user_id = ${userId}
        AND status IN ('pending', 'processing')
    `;

    if (existingRequest.length > 0) {
      return Response.json(
        { error: "You already have a pending deletion request" },
        { status: 400 },
      );
    }

    // Create deletion request
    const request_record = await sql`
      INSERT INTO data_deletion_requests (user_id, request_type, notes)
      VALUES (${userId}, ${type}, ${reason || null})
      RETURNING *
    `;

    // Log the deletion request
    await sql`
      INSERT INTO gdpr_audit_log (user_id, action_type, action_details)
      VALUES (
        ${userId},
        'data_deletion',
        ${JSON.stringify({
          type,
          reason,
          timestamp: new Date().toISOString(),
          status: "requested",
        })}
      )
    `;

    return Response.json(
      {
        success: true,
        message:
          "Deletion request submitted. Your account will be processed within 30 days as per GDPR requirements.",
        request: request_record[0],
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("POST /api/gdpr/delete error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Get deletion request status
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requests = await sql`
      SELECT * FROM data_deletion_requests
      WHERE user_id = ${session.user.id}
      ORDER BY requested_at DESC
      LIMIT 10
    `;

    return Response.json({ requests });
  } catch (err) {
    console.error("GET /api/gdpr/delete error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Process deletion request (admin only)
export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin status
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
    const requestId = searchParams.get("request_id");

    if (!requestId) {
      return Response.json({ error: "Missing request_id" }, { status: 400 });
    }

    // Get the deletion request
    const deletionRequest = await sql`
      SELECT * FROM data_deletion_requests WHERE id = ${requestId}
    `;

    if (deletionRequest.length === 0) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }

    const targetUserId = deletionRequest[0].user_id;

    // Execute full deletion in a transaction
    await sql.transaction(async (txn) => [
      // Delete user content
      txn`DELETE FROM tip_comments WHERE user_id = ${targetUserId}`,
      txn`DELETE FROM tip_engagements WHERE user_id = ${targetUserId}`,
      txn`DELETE FROM tips WHERE user_id = ${targetUserId}`,
      txn`DELETE FROM safety_reports WHERE user_id = ${targetUserId}`,
      txn`DELETE FROM bookings WHERE user_id = ${targetUserId}`,
      txn`DELETE FROM trips WHERE user_id = ${targetUserId}`,
      txn`DELETE FROM saved_places WHERE user_id = ${targetUserId}`,
      txn`DELETE FROM user_badges WHERE user_id = ${targetUserId}`,
      txn`DELETE FROM user_follows WHERE follower_id = ${targetUserId} OR following_id = ${targetUserId}`,
      txn`DELETE FROM user_consents WHERE user_id = ${targetUserId}`,
      txn`DELETE FROM user_profiles WHERE user_id = ${targetUserId}`,
      txn`DELETE FROM auth_users WHERE id = ${targetUserId}`,

      // Mark request as completed
      txn`
        UPDATE data_deletion_requests
        SET 
          status = 'completed',
          completed_at = NOW(),
          processed_by = ${session.user.id}
        WHERE id = ${requestId}
      `,

      // Final audit log entry
      txn`
        INSERT INTO gdpr_audit_log (user_id, action_type, action_details)
        VALUES (
          ${targetUserId},
          'data_deletion',
          ${JSON.stringify({
            status: "completed",
            processed_by: session.user.id,
            timestamp: new Date().toISOString(),
          })}
        )
      `,
    ]);

    return Response.json({
      success: true,
      message: "User data permanently deleted",
    });
  } catch (err) {
    console.error("DELETE /api/gdpr/delete error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
