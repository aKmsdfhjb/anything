import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Helper: check if user is trip owner or accepted collaborator
async function canAccessTrip(tripId, userId) {
  const result = await sql`
    SELECT 1 FROM trips WHERE id = ${tripId} AND user_id = ${userId}
    UNION
    SELECT 1 FROM trip_collaborators WHERE trip_id = ${tripId} AND user_id = ${userId} AND status = 'accepted'
  `;
  return result.length > 0;
}

// Helper: check if user is trip owner
async function isTripOwner(tripId, userId) {
  const result =
    await sql`SELECT 1 FROM trips WHERE id = ${tripId} AND user_id = ${userId}`;
  return result.length > 0;
}

// GET - list collaborators for a trip, or list trips shared with me, or search users
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get("trip_id");
    const mode = searchParams.get("mode"); // 'my_invites' or 'search_users'
    const searchQuery = searchParams.get("q");

    // Search users to invite
    if (mode === "search_users" && searchQuery) {
      const users = await sql`
        SELECT up.user_id, up.username, up.profile_image, up.bio, au.name
        FROM user_profiles up
        JOIN auth_users au ON up.user_id = au.id
        WHERE up.user_id != ${session.user.id}
          AND (
            LOWER(up.username) LIKE LOWER(${"%" + searchQuery + "%"})
            OR LOWER(COALESCE(au.name, '')) LIKE LOWER(${"%" + searchQuery + "%"})
          )
        LIMIT 20
      `;
      return Response.json({ users });
    }

    // Get friends eligible to invite (not already in the trip)
    if (mode === "friends_to_invite" && tripId) {
      const hasAccess = await canAccessTrip(tripId, session.user.id);
      if (!hasAccess) {
        return Response.json({ error: "Access denied" }, { status: 403 });
      }
      const friends = await sql`
        SELECT up.user_id, up.username, up.profile_image, up.bio
        FROM friend_requests fr
        JOIN user_profiles up ON (
          CASE 
            WHEN fr.sender_id = ${session.user.id} THEN fr.receiver_id
            ELSE fr.sender_id
          END = up.user_id
        )
        WHERE fr.status = 'accepted'
          AND (fr.sender_id = ${session.user.id} OR fr.receiver_id = ${session.user.id})
          AND up.user_id NOT IN (
            SELECT user_id FROM trip_collaborators WHERE trip_id = ${tripId}
          )
          AND up.user_id != (SELECT user_id FROM trips WHERE id = ${tripId})
        ORDER BY up.username ASC
      `;
      return Response.json({ friends });
    }

    // Get my pending invitations
    if (mode === "my_invites") {
      const invites = await sql`
        SELECT 
          tc.*,
          t.trip_name,
          t.start_date,
          t.end_date,
          t.custom_destination,
          d.name as destination_name,
          COALESCE(d.country, '') as country,
          d.image_url,
          inviter.username as invited_by_username,
          inviter.profile_image as invited_by_image
        FROM trip_collaborators tc
        JOIN trips t ON tc.trip_id = t.id
        LEFT JOIN destinations d ON t.destination_id = d.id
        LEFT JOIN user_profiles inviter ON tc.invited_by = inviter.user_id
        WHERE tc.user_id = ${session.user.id}
        ORDER BY tc.created_at DESC
      `;
      return Response.json({ invites });
    }

    // List collaborators on a specific trip
    if (!tripId) {
      return Response.json({ error: "Missing trip_id" }, { status: 400 });
    }

    const hasAccess = await canAccessTrip(tripId, session.user.id);
    if (!hasAccess) {
      return Response.json({ error: "Access denied" }, { status: 403 });
    }

    // Get trip owner info
    const ownerInfo = await sql`
      SELECT t.user_id, up.username, up.profile_image
      FROM trips t
      LEFT JOIN user_profiles up ON t.user_id = up.user_id
      WHERE t.id = ${tripId}
    `;

    const collaborators = await sql`
      SELECT 
        tc.*,
        up.username,
        up.profile_image,
        au.email
      FROM trip_collaborators tc
      LEFT JOIN user_profiles up ON tc.user_id = up.user_id
      LEFT JOIN auth_users au ON tc.user_id = au.id
      WHERE tc.trip_id = ${tripId}
      ORDER BY tc.created_at ASC
    `;

    return Response.json({
      owner: ownerInfo[0] || null,
      collaborators,
    });
  } catch (err) {
    console.error("GET /api/trip-collaborators error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST - invite a user to collaborate on a trip
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { trip_id, user_id, role } = body;

    if (!trip_id || !user_id) {
      return Response.json(
        { error: "Missing trip_id or user_id" },
        { status: 400 },
      );
    }

    // Only trip owner can invite
    const isOwner = await isTripOwner(trip_id, session.user.id);
    if (!isOwner) {
      // Also allow accepted collaborators to invite
      const isCollab = await canAccessTrip(trip_id, session.user.id);
      if (!isCollab) {
        return Response.json(
          { error: "Only trip members can invite others" },
          { status: 403 },
        );
      }
    }

    // Can't invite yourself
    if (user_id === session.user.id) {
      return Response.json(
        { error: "Cannot invite yourself" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO trip_collaborators (trip_id, user_id, invited_by, role, status)
      VALUES (${trip_id}, ${user_id}, ${session.user.id}, ${role || "editor"}, 'pending')
      ON CONFLICT (trip_id, user_id) DO UPDATE SET status = 'pending', role = ${role || "editor"}
      RETURNING *
    `;

    return Response.json({ collaborator: result[0] }, { status: 201 });
  } catch (err) {
    console.error("POST /api/trip-collaborators error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT - accept or decline an invitation
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
      UPDATE trip_collaborators 
      SET status = ${status}
      WHERE id = ${id} AND user_id = ${session.user.id}
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json({ error: "Invitation not found" }, { status: 404 });
    }

    return Response.json({ collaborator: result[0] });
  } catch (err) {
    console.error("PUT /api/trip-collaborators error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE - remove a collaborator
export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const tripId = searchParams.get("trip_id");

    if (!id) {
      return Response.json(
        { error: "Missing collaborator id" },
        { status: 400 },
      );
    }

    // Trip owner can remove anyone, users can remove themselves
    if (tripId) {
      const isOwner = await isTripOwner(tripId, session.user.id);
      if (isOwner) {
        await sql`DELETE FROM trip_collaborators WHERE id = ${id} AND trip_id = ${tripId}`;
        return Response.json({ success: true });
      }
    }

    // User removing themselves
    await sql`DELETE FROM trip_collaborators WHERE id = ${id} AND user_id = ${session.user.id}`;
    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/trip-collaborators error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
