import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "trending"; // trending, latest, popular

    let tips;

    if (type === "latest") {
      // Latest tips (last 24 hours)
      tips = await sql`
        SELECT 
          t.*,
          d.name as destination_name,
          d.country as destination_country,
          d.latitude,
          d.longitude,
          up.username,
          up.profile_image,
          up.reputation_score,
          up.is_verified,
          t.upvotes,
          t.views,
          EXTRACT(EPOCH FROM (NOW() - t.created_at))/60 as minutes_ago
        FROM tips t
        JOIN destinations d ON t.destination_id = d.id
        JOIN user_profiles up ON t.user_id = up.user_id
        WHERE t.created_at >= NOW() - INTERVAL '24 hours'
        ORDER BY t.created_at DESC
        LIMIT 20
      `;
    } else if (type === "popular") {
      // Most upvoted all time
      tips = await sql`
        SELECT 
          t.*,
          d.name as destination_name,
          d.country as destination_country,
          d.latitude,
          d.longitude,
          up.username,
          up.profile_image,
          up.reputation_score,
          up.is_verified,
          t.upvotes,
          t.views
        FROM tips t
        JOIN destinations d ON t.destination_id = d.id
        JOIN user_profiles up ON t.user_id = up.user_id
        WHERE t.category = 'recommend'
        ORDER BY t.upvotes DESC, t.views DESC
        LIMIT 20
      `;
    } else {
      // Trending (high engagement in last 48 hours)
      tips = await sql`
        SELECT 
          t.*,
          d.name as destination_name,
          d.country as destination_country,
          d.latitude,
          d.longitude,
          up.username,
          up.profile_image,
          up.reputation_score,
          up.is_verified,
          t.upvotes,
          t.views,
          t.engagement_score
        FROM tips t
        JOIN destinations d ON t.destination_id = d.id
        JOIN user_profiles up ON t.user_id = up.user_id
        WHERE t.created_at >= NOW() - INTERVAL '48 hours'
        ORDER BY t.engagement_score DESC, t.upvotes DESC
        LIMIT 20
      `;
    }

    return Response.json({ tips, type });
  } catch (err) {
    console.error("GET /api/tips/trending error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
