import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { facebook_url, tiktok_url, twitter_url, instagram_url } = body;

    const result = await sql`
      UPDATE user_profiles
      SET 
        facebook_url = ${facebook_url || null},
        tiktok_url = ${tiktok_url || null},
        twitter_url = ${twitter_url || null},
        instagram_url = ${instagram_url || null}
      WHERE user_id = ${session.user.id}
      RETURNING *
    `;

    return Response.json({ profile: result[0] });
  } catch (err) {
    console.error("PUT /api/profile/social-links error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
