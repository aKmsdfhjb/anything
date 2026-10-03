import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const rows = await sql`
      SELECT up.id, up.user_id, up.username, up.bio, up.profile_image, 
             up.facebook_url, up.tiktok_url, up.twitter_url, up.instagram_url, 
             up.display_countdown_trip_id, up.created_at, au.email,
             t.trip_name as countdown_trip_name,
             t.start_date as countdown_start_date,
             t.end_date as countdown_end_date,
             t.custom_destination as countdown_custom_destination,
             COALESCE(d.name, t.custom_destination) as countdown_destination_name,
             COALESCE(d.country, '') as countdown_country,
             d.image_url as countdown_image_url
      FROM user_profiles up
      JOIN auth_users au ON up.user_id = au.id
      LEFT JOIN trips t ON up.display_countdown_trip_id = t.id
      LEFT JOIN destinations d ON t.destination_id = d.id
      WHERE up.user_id = ${userId}
      LIMIT 1
    `;

    const profile = rows?.[0] || null;
    return Response.json({ profile });
  } catch (err) {
    console.error("GET /api/profile error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { username, bio, profile_image } = body || {};

    if (
      !username ||
      typeof username !== "string" ||
      username.trim().length === 0
    ) {
      return Response.json({ error: "Username is required" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO user_profiles (user_id, username, bio, profile_image)
      VALUES (${userId}, ${username.trim()}, ${bio || null}, ${profile_image || null})
      RETURNING id, user_id, username, bio, profile_image, created_at
    `;

    const profile = result?.[0] || null;
    return Response.json({ profile });
  } catch (err) {
    console.error("POST /api/profile error", err);
    if (err.message?.includes("duplicate key")) {
      return Response.json(
        { error: "Username already taken" },
        { status: 400 },
      );
    }
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { username, bio, profile_image, display_countdown_trip_id } =
      body || {};

    let query = "UPDATE user_profiles SET ";
    const setClauses = [];
    const values = [];
    let paramCount = 1;

    if (
      username !== undefined &&
      typeof username === "string" &&
      username.trim().length > 0
    ) {
      setClauses.push(`username = $${paramCount}`);
      values.push(username.trim());
      paramCount++;
    }

    if (bio !== undefined) {
      setClauses.push(`bio = $${paramCount}`);
      values.push(bio || null);
      paramCount++;
    }

    if (profile_image !== undefined) {
      setClauses.push(`profile_image = $${paramCount}`);
      values.push(profile_image || null);
      paramCount++;
    }

    if (display_countdown_trip_id !== undefined) {
      setClauses.push(`display_countdown_trip_id = $${paramCount}`);
      values.push(display_countdown_trip_id || null);
      paramCount++;
    }

    if (setClauses.length === 0) {
      return Response.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    query += setClauses.join(", ");
    query += ` WHERE user_id = $${paramCount} RETURNING id, user_id, username, bio, profile_image, facebook_url, tiktok_url, twitter_url, instagram_url, display_countdown_trip_id, created_at`;
    values.push(userId);

    const result = await sql(query, values);
    const profile = result?.[0] || null;

    return Response.json({ profile });
  } catch (err) {
    console.error("PUT /api/profile error", err);
    if (err.message?.includes("duplicate key")) {
      return Response.json(
        { error: "Username already taken" },
        { status: 400 },
      );
    }
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
