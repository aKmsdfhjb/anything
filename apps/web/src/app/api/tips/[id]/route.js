import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const tips = await sql`
      SELECT t.id, t.user_id, t.destination_id, t.title, t.content, t.video_url, t.tip_type, 
             t.created_at, t.photo_url, t.photo_urls, t.location_latitude, t.location_longitude,
             t.location_name, t.category, t.venue_type, t.venue_name, t.best_time_to_visit,
             t.special_tips, t.upvotes, t.views, t.engagement_score, t.comment_count,
             t.warning_severity, t.verified_post,
             up.username, up.profile_image, up.is_verified, up.reputation_score,
             d.name as destination_name, d.country as destination_country,
             d.latitude as dest_latitude, d.longitude as dest_longitude
      FROM tips t
      JOIN user_profiles up ON t.user_id = up.user_id
      JOIN destinations d ON t.destination_id = d.id
      WHERE t.id = ${parseInt(id)}
      LIMIT 1
    `;

    const tip = tips?.[0] || null;
    if (!tip) {
      return Response.json({ error: "Tip not found" }, { status: 404 });
    }

    return Response.json({ tip });
  } catch (err) {
    console.error("GET /api/tips/[id] error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const userId = session.user.id;

    const result = await sql`
      DELETE FROM tips
      WHERE id = ${parseInt(id)} AND user_id = ${userId}
      RETURNING id
    `;

    if (result.length === 0) {
      return Response.json(
        { error: "Tip not found or unauthorized" },
        { status: 404 },
      );
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/tips/[id] error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
