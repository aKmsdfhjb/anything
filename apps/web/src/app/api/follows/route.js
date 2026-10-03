import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get followers or following
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'followers' or 'following'
    const userId = searchParams.get("user_id") || session.user.id;

    let users;
    if (type === "followers") {
      users = await sql`
        SELECT 
          u.id,
          up.username,
          up.bio,
          up.profile_image,
          uf.created_at as followed_at
        FROM user_follows uf
        JOIN auth_users u ON uf.follower_id = u.id
        JOIN user_profiles up ON u.id = up.user_id
        WHERE uf.following_id = ${userId}
        ORDER BY uf.created_at DESC
      `;
    } else if (type === "following") {
      users = await sql`
        SELECT 
          u.id,
          up.username,
          up.bio,
          up.profile_image,
          uf.created_at as followed_at
        FROM user_follows uf
        JOIN auth_users u ON uf.following_id = u.id
        JOIN user_profiles up ON u.id = up.user_id
        WHERE uf.follower_id = ${userId}
        ORDER BY uf.created_at DESC
      `;
    } else {
      return Response.json(
        { error: "Invalid type parameter" },
        { status: 400 },
      );
    }

    return Response.json({ users });
  } catch (err) {
    console.error("GET /api/follows error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Follow a user
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { following_id } = body;

    if (!following_id) {
      return Response.json({ error: "Missing following_id" }, { status: 400 });
    }

    if (following_id === session.user.id) {
      return Response.json(
        { error: "Cannot follow yourself" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO user_follows (follower_id, following_id)
      VALUES (${session.user.id}, ${following_id})
      ON CONFLICT (follower_id, following_id) DO NOTHING
      RETURNING *
    `;

    return Response.json({ follow: result[0] }, { status: 201 });
  } catch (err) {
    console.error("POST /api/follows error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Unfollow a user
export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const following_id = searchParams.get("following_id");

    if (!following_id) {
      return Response.json({ error: "Missing following_id" }, { status: 400 });
    }

    await sql`
      DELETE FROM user_follows
      WHERE follower_id = ${session.user.id} AND following_id = ${following_id}
    `;

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/follows error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
