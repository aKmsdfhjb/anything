import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// GET — list friends, pending requests, or search users
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode"); // 'friends', 'pending', 'sent', 'search', 'check'
    const q = searchParams.get("q");
    const userId = searchParams.get("user_id");

    // Check if a specific user is a friend
    if (mode === "check" && userId) {
      const friendship = await sql`
        SELECT id, status FROM friend_requests
        WHERE (
          (sender_id = ${session.user.id} AND receiver_id = ${userId})
          OR (sender_id = ${userId} AND receiver_id = ${session.user.id})
        )
        ORDER BY created_at DESC
        LIMIT 1
      `;
      const isFriend =
        friendship.length > 0 && friendship[0].status === "accepted";
      const isPending =
        friendship.length > 0 && friendship[0].status === "pending";
      return Response.json({
        isFriend,
        isPending,
        request: friendship[0] || null,
      });
    }

    // Search users to add as friends
    if (mode === "search" && q) {
      const users = await sql`
        SELECT 
          up.user_id, up.username, up.profile_image, up.bio, up.is_verified, au.name,
          CASE WHEN fr_sent.id IS NOT NULL THEN fr_sent.status ELSE NULL END as sent_status,
          CASE WHEN fr_recv.id IS NOT NULL THEN fr_recv.status ELSE NULL END as recv_status
        FROM user_profiles up
        JOIN auth_users au ON up.user_id = au.id
        LEFT JOIN friend_requests fr_sent 
          ON fr_sent.sender_id = ${session.user.id} AND fr_sent.receiver_id = up.user_id
        LEFT JOIN friend_requests fr_recv 
          ON fr_recv.sender_id = up.user_id AND fr_recv.receiver_id = ${session.user.id}
        WHERE up.user_id != ${session.user.id}
          AND (
            LOWER(up.username) LIKE LOWER(${"%" + q + "%"})
            OR LOWER(COALESCE(au.name, '')) LIKE LOWER(${"%" + q + "%"})
          )
        LIMIT 20
      `;

      const enriched = users.map((u) => {
        let friendStatus = "none";
        if (u.sent_status === "accepted" || u.recv_status === "accepted")
          friendStatus = "friends";
        else if (u.sent_status === "pending") friendStatus = "request_sent";
        else if (u.recv_status === "pending") friendStatus = "request_received";
        return { ...u, friend_status: friendStatus };
      });

      return Response.json({ users: enriched });
    }

    // Accepted friends
    if (mode === "friends" || !mode) {
      const targetUser = userId || session.user.id;
      const friends = await sql`
        SELECT 
          up.user_id, up.username, up.profile_image, up.bio, up.is_verified,
          fr.created_at as friends_since
        FROM friend_requests fr
        JOIN user_profiles up ON (
          CASE 
            WHEN fr.sender_id = ${targetUser} THEN fr.receiver_id
            ELSE fr.sender_id
          END = up.user_id
        )
        WHERE fr.status = 'accepted'
          AND (fr.sender_id = ${targetUser} OR fr.receiver_id = ${targetUser})
        ORDER BY up.username ASC
      `;
      return Response.json({ friends });
    }

    // Pending incoming requests
    if (mode === "pending") {
      const requests = await sql`
        SELECT 
          fr.id, fr.sender_id, fr.created_at,
          up.username, up.profile_image, up.bio, up.is_verified
        FROM friend_requests fr
        JOIN user_profiles up ON fr.sender_id = up.user_id
        WHERE fr.receiver_id = ${session.user.id} AND fr.status = 'pending'
        ORDER BY fr.created_at DESC
      `;
      return Response.json({ requests });
    }

    // Sent requests still pending
    if (mode === "sent") {
      const requests = await sql`
        SELECT 
          fr.id, fr.receiver_id, fr.created_at,
          up.username, up.profile_image, up.bio, up.is_verified
        FROM friend_requests fr
        JOIN user_profiles up ON fr.receiver_id = up.user_id
        WHERE fr.sender_id = ${session.user.id} AND fr.status = 'pending'
        ORDER BY fr.created_at DESC
      `;
      return Response.json({ requests });
    }

    return Response.json({ error: "Invalid mode" }, { status: 400 });
  } catch (err) {
    console.error("GET /api/friends error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST — send a friend request
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { receiver_id } = body;

    if (!receiver_id) {
      return Response.json({ error: "Missing receiver_id" }, { status: 400 });
    }

    if (receiver_id === session.user.id) {
      return Response.json({ error: "Cannot add yourself" }, { status: 400 });
    }

    // Check if there's already a request in either direction
    const existing = await sql`
      SELECT id, status, sender_id, receiver_id FROM friend_requests
      WHERE (sender_id = ${session.user.id} AND receiver_id = ${receiver_id})
         OR (sender_id = ${receiver_id} AND receiver_id = ${session.user.id})
      LIMIT 1
    `;

    if (existing.length > 0) {
      const req = existing[0];
      if (req.status === "accepted") {
        return Response.json({ error: "Already friends" }, { status: 400 });
      }
      // If they sent us a request, auto-accept it
      if (req.sender_id === receiver_id && req.status === "pending") {
        const result = await sql`
          UPDATE friend_requests SET status = 'accepted', responded_at = NOW()
          WHERE id = ${req.id}
          RETURNING *
        `;
        return Response.json(
          { request: result[0], auto_accepted: true },
          { status: 200 },
        );
      }
      // If we already sent one, just return it
      if (req.sender_id === session.user.id && req.status === "pending") {
        return Response.json(
          { request: req, already_sent: true },
          { status: 200 },
        );
      }
      // If previously declined, allow re-sending
      if (req.status === "declined") {
        const result = await sql`
          UPDATE friend_requests 
          SET sender_id = ${session.user.id}, receiver_id = ${receiver_id}, 
              status = 'pending', created_at = NOW(), responded_at = NULL
          WHERE id = ${req.id}
          RETURNING *
        `;
        return Response.json({ request: result[0] }, { status: 201 });
      }
    }

    const result = await sql`
      INSERT INTO friend_requests (sender_id, receiver_id, status)
      VALUES (${session.user.id}, ${receiver_id}, 'pending')
      RETURNING *
    `;

    return Response.json({ request: result[0] }, { status: 201 });
  } catch (err) {
    console.error("POST /api/friends error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT — accept or decline a friend request
export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return Response.json({ error: "Missing id or status" }, { status: 400 });
    }

    if (!["accepted", "declined"].includes(status)) {
      return Response.json(
        { error: "Status must be 'accepted' or 'declined'" },
        { status: 400 },
      );
    }

    const result = await sql`
      UPDATE friend_requests 
      SET status = ${status}, responded_at = NOW()
      WHERE id = ${id} AND receiver_id = ${session.user.id} AND status = 'pending'
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }

    return Response.json({ request: result[0] });
  } catch (err) {
    console.error("PUT /api/friends error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE — unfriend someone
export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return Response.json({ error: "Missing user_id" }, { status: 400 });
    }

    await sql`
      DELETE FROM friend_requests
      WHERE (sender_id = ${session.user.id} AND receiver_id = ${userId})
         OR (sender_id = ${userId} AND receiver_id = ${session.user.id})
    `;

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/friends error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
