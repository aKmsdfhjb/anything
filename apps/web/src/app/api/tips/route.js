import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const destinationId = searchParams.get("destination_id");
    const category = searchParams.get("category");
    const includeAll = searchParams.get("include_all"); // for admin moderation

    let query = `
      SELECT 
        t.*,
        up.username,
        up.profile_image,
        up.reputation_score,
        up.is_verified,
        d.name as destination_name,
        d.country as destination_country
      FROM tips t
      JOIN user_profiles up ON t.user_id = up.user_id
      JOIN destinations d ON t.destination_id = d.id
      WHERE 1=1
    `;
    const params = [];

    // Only show approved tips to normal users
    if (!includeAll) {
      query += ` AND (t.moderation_status = 'approved' OR t.moderation_status IS NULL)`;
    }

    if (destinationId) {
      params.push(parseInt(destinationId));
      query += ` AND t.destination_id = $${params.length}`;
    }

    if (category) {
      params.push(category);
      query += ` AND t.category = $${params.length}`;
    }

    query += ` ORDER BY t.created_at DESC LIMIT 50`;

    const tips = await sql(query, params);

    return Response.json({ tips });
  } catch (err) {
    console.error("GET /api/tips error", err);
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
    const {
      destination_id,
      title,
      content,
      video_url,
      photo_url,
      photo_urls,
      tip_type,
      location_latitude,
      location_longitude,
      location_name,
      category,
      warning_severity,
      venue_type,
      best_time_to_visit,
      special_tips,
    } = body || {};

    if (!destination_id || !title || !tip_type) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (tip_type !== "text" && tip_type !== "video") {
      return Response.json({ error: "Invalid tip type" }, { status: 400 });
    }

    if (tip_type === "text" && !content) {
      return Response.json(
        { error: "Text tips require content" },
        { status: 400 },
      );
    }

    if (tip_type === "video" && !video_url) {
      return Response.json(
        { error: "Video tips require video_url" },
        { status: 400 },
      );
    }

    // Get user profile for verification
    const userProfile = await sql`
      SELECT 
        reputation_score,
        is_verified,
        verified_posts_count,
        can_post_without_photo,
        created_at
      FROM user_profiles
      WHERE user_id = ${userId}
    `;

    if (userProfile.length === 0) {
      return Response.json(
        { error: "Profile not found. Please create a profile first." },
        { status: 400 },
      );
    }

    const profile = userProfile[0];
    const accountAgeDays = Math.floor(
      (Date.now() - new Date(profile.created_at).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    const hasPhoto = !!photo_url || (photo_urls && photo_urls.length > 0);
    const hasLocation = !!(location_latitude && location_longitude);
    const isVerifiedTraveler = profile.is_verified;
    const hasGoodReputation = profile.reputation_score >= 50;
    const isNewAccount = accountAgeDays < 7;

    const isWarningPost = category === "avoid" || category === "safety_warning";

    if (isWarningPost && !isVerifiedTraveler && !hasGoodReputation) {
      return Response.json(
        {
          error:
            "Warning posts require verified status or 50+ reputation to prevent false reports",
        },
        { status: 403 },
      );
    }

    if (isNewAccount && !hasPhoto) {
      return Response.json(
        {
          error: `New accounts must include a photo to verify authenticity (account age: ${accountAgeDays} days).`,
        },
        { status: 403 },
      );
    }

    if (profile.verified_posts_count < 5 && !hasPhoto && !isVerifiedTraveler) {
      return Response.json(
        {
          error: `First 5 posts require photo verification. Photos posted: ${profile.verified_posts_count}/5`,
        },
        { status: 403 },
      );
    }

    if (
      warning_severity === "critical" &&
      (!hasPhoto || !hasLocation || !isVerifiedTraveler)
    ) {
      return Response.json(
        {
          error:
            "Critical safety warnings require photo, location, and verified traveler status",
        },
        { status: 403 },
      );
    }

    const verificationPassed =
      hasPhoto || isVerifiedTraveler || hasGoodReputation;

    // All new tips start as pending moderation
    const moderationStatus = "pending";

    const photoUrlsJson =
      photo_urls && photo_urls.length > 0 ? JSON.stringify(photo_urls) : null;

    const result = await sql`
      INSERT INTO tips (
        user_id, 
        destination_id, 
        title, 
        content, 
        video_url, 
        photo_url, 
        photo_urls,
        tip_type, 
        location_latitude, 
        location_longitude, 
        location_name,
        category,
        verified_post,
        warning_severity,
        venue_type,
        best_time_to_visit,
        special_tips,
        moderation_status
      )
      VALUES (
        ${userId}, 
        ${parseInt(destination_id)}, 
        ${title}, 
        ${content || null}, 
        ${video_url || null}, 
        ${photo_url || null}, 
        ${photoUrlsJson},
        ${tip_type}, 
        ${location_latitude || null}, 
        ${location_longitude || null}, 
        ${location_name || null},
        ${category || "recommend"},
        ${verificationPassed},
        ${warning_severity || null},
        ${venue_type || null},
        ${best_time_to_visit || null},
        ${special_tips || null},
        ${moderationStatus}
      )
      RETURNING *
    `;

    const tip = result?.[0] || null;
    const tipId = tip.id;

    // Log verification
    await sql`
      INSERT INTO tip_verification_log (
        tip_id, user_id, has_photo, has_location, account_age_days,
        reputation_at_post, verified_traveler, verification_passed
      )
      VALUES (
        ${tipId}, ${userId}, ${hasPhoto}, ${hasLocation}, ${accountAgeDays},
        ${profile.reputation_score}, ${isVerifiedTraveler}, ${verificationPassed}
      )
    `;

    if (hasPhoto) {
      await sql`
        UPDATE user_profiles
        SET verified_posts_count = verified_posts_count + 1
        WHERE user_id = ${userId}
      `;
    }

    if (hasPhoto && hasLocation) {
      const badgeResult = await sql`
        SELECT id FROM badges WHERE name = 'Visited' LIMIT 1
      `;
      if (badgeResult.length > 0) {
        await sql`
          INSERT INTO user_badges (user_id, badge_id, destination_id)
          VALUES (${userId}, ${badgeResult[0].id}, ${parseInt(destination_id)})
          ON CONFLICT (user_id, badge_id, destination_id) DO NOTHING
        `;
      }
    }

    return Response.json({
      tip,
      verification_passed: verificationPassed,
      message:
        "Your tip has been submitted and is pending review by our moderators. You'll see it go live once approved!",
    });
  } catch (err) {
    console.error("POST /api/tips error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
