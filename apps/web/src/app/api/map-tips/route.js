import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// POST /api/map-tips — submit a tip linked to a map_location
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    const {
      map_location_id, // already-created location id (preferred)
      // OR supply these to auto-create the location:
      location_name,
      location_address,
      location_latitude,
      location_longitude,
      location_category,
      location_place_id,
      // tip fields
      title,
      content,
      category, // recommend | avoid | safety_warning
      venue_type,
      photo_url,
      photo_urls,
    } = body || {};

    if (!content || content.trim().length < 5) {
      return Response.json(
        { error: "Tip content is required (min 5 characters)" },
        { status: 400 },
      );
    }

    // Get or create map_location
    let finalLocationId = map_location_id ? parseInt(map_location_id) : null;

    if (!finalLocationId) {
      if (
        !location_name ||
        location_latitude == null ||
        location_longitude == null
      ) {
        return Response.json(
          {
            error:
              "Either map_location_id or location_name + coordinates are required",
          },
          { status: 400 },
        );
      }

      // Check by place_id first
      if (location_place_id) {
        const existing = await sql`
          SELECT id FROM map_locations WHERE place_id = ${location_place_id} LIMIT 1
        `;
        if (existing.length > 0) {
          finalLocationId = existing[0].id;
        }
      }

      // Check by proximity + name
      if (!finalLocationId) {
        const existing = await sql`
          SELECT id FROM map_locations
          WHERE ABS(latitude - ${parseFloat(location_latitude)}) < 0.0003
            AND ABS(longitude - ${parseFloat(location_longitude)}) < 0.0003
            AND LOWER(name) = LOWER(${location_name})
          LIMIT 1
        `;
        if (existing.length > 0) {
          finalLocationId = existing[0].id;
        }
      }

      // Create new location
      if (!finalLocationId) {
        const validCategories = [
          "general",
          "food",
          "hotel",
          "beach",
          "attraction",
          "nightlife",
          "shopping",
          "transport",
          "gem",
        ];
        const cat = validCategories.includes(location_category)
          ? location_category
          : "general";

        const created = await sql`
          INSERT INTO map_locations (name, address, latitude, longitude, category, place_id)
          VALUES (
            ${location_name},
            ${location_address || null},
            ${parseFloat(location_latitude)},
            ${parseFloat(location_longitude)},
            ${cat},
            ${location_place_id || null}
          )
          RETURNING id
        `;
        finalLocationId = created[0].id;
      }
    }

    // Get user profile
    const profiles = await sql`
      SELECT reputation_score, is_verified, verified_posts_count
      FROM user_profiles WHERE user_id = ${userId} LIMIT 1
    `;

    if (profiles.length === 0) {
      return Response.json(
        { error: "Profile not found. Please create a profile first." },
        { status: 400 },
      );
    }

    const profile = profiles[0];
    const hasPhoto = !!photo_url || (photo_urls && photo_urls.length > 0);
    const validCategory = ["recommend", "avoid", "safety_warning"].includes(
      category,
    )
      ? category
      : "recommend";
    const photoUrlsJson =
      photo_urls && photo_urls.length > 0 ? JSON.stringify(photo_urls) : null;

    // Moderation: start as pending
    const tip = await sql`
      INSERT INTO tips (
        user_id, destination_id, map_location_id,
        title, content, tip_type,
        photo_url, photo_urls,
        location_latitude, location_longitude, location_name,
        category, venue_type, verified_post, moderation_status
      )
      SELECT
        ${userId},
        -- find nearest destination for backwards compat (optional)
        (
          SELECT d.id FROM destinations d
          ORDER BY (d.latitude - ${parseFloat(location_latitude || 0)})^2 + (d.longitude - ${parseFloat(location_longitude || 0)})^2
          LIMIT 1
        ),
        ${finalLocationId},
        ${(title || location_name || "Tip").substring(0, 200)},
        ${content.trim()},
        'text',
        ${photo_url || null},
        ${photoUrlsJson},
        ${location_latitude ? parseFloat(location_latitude) : null},
        ${location_longitude ? parseFloat(location_longitude) : null},
        ${location_name || null},
        ${validCategory},
        ${venue_type || null},
        ${hasPhoto || profile.is_verified},
        'approved'
      RETURNING *
    `;

    // Update verified posts count if photo was included
    if (hasPhoto) {
      await sql`
        UPDATE user_profiles
        SET verified_posts_count = verified_posts_count + 1
        WHERE user_id = ${userId}
      `;
    }

    return Response.json({
      tip: tip[0],
      map_location_id: finalLocationId,
      message: "Tip published!",
    });
  } catch (err) {
    console.error("POST /api/map-tips error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// GET /api/map-tips?location_id=X — get all tips for a location, newest first
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("location_id");

    if (!locationId) {
      return Response.json({ error: "location_id required" }, { status: 400 });
    }

    const tips = await sql`
      SELECT
        t.id, t.title, t.content, t.category, t.venue_type, t.venue_name,
        t.photo_url, t.photo_urls, t.best_time_to_visit, t.special_tips,
        t.location_name, t.upvotes, t.views, t.comment_count,
        t.created_at, t.map_location_id,
        up.username, up.profile_image, up.is_verified, up.reputation_score
      FROM tips t
      JOIN user_profiles up ON t.user_id = up.user_id
      WHERE t.map_location_id = ${parseInt(locationId)}
        AND (t.moderation_status = 'approved' OR t.moderation_status IS NULL)
      ORDER BY t.created_at DESC
      LIMIT 100
    `;

    const location = await sql`
      SELECT * FROM map_locations WHERE id = ${parseInt(locationId)} LIMIT 1
    `;

    return Response.json({ tips, location: location[0] || null });
  } catch (err) {
    console.error("GET /api/map-tips error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
