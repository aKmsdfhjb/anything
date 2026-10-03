import sql from "@/app/api/utils/sql";

// GET /api/map-pins — return all location pins with tip counts + latest tip info
// Also handles tips without map_location_id (grouped by proximity)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category"); // optional filter
    const locationId = searchParams.get("location_id"); // get tips for a specific location

    // ─── Tips for a specific location ───────────────────────────────────────
    if (locationId) {
      const tips = await sql`
        SELECT
          t.id, t.title, t.content, t.category, t.venue_type, t.venue_name,
          t.photo_url, t.photo_urls, t.best_time_to_visit, t.special_tips,
          t.location_name, t.location_latitude, t.location_longitude,
          t.upvotes, t.views, t.comment_count, t.engagement_score,
          t.created_at, t.map_location_id,
          up.username, up.profile_image, up.is_verified,
          ml.name AS location_display_name, ml.address, ml.category AS location_category,
          ml.latitude, ml.longitude
        FROM tips t
        JOIN user_profiles up ON t.user_id = up.user_id
        LEFT JOIN map_locations ml ON t.map_location_id = ml.id
        WHERE t.map_location_id = ${parseInt(locationId)}
          AND (t.moderation_status = 'approved' OR t.moderation_status IS NULL)
        ORDER BY t.created_at DESC
        LIMIT 100
      `;
      return Response.json({ tips });
    }

    // ─── All location pins (grouped by map_location_id) ────────────────────
    const locationPins = await sql`
      SELECT
        ml.id, ml.name, ml.address, ml.latitude, ml.longitude,
        ml.category, ml.place_id, ml.image_url,
        COUNT(t.id)::int AS tip_count,
        MAX(t.created_at) AS latest_tip_at,
        (
          SELECT t2.content FROM tips t2
          WHERE t2.map_location_id = ml.id
            AND (t2.moderation_status = 'approved' OR t2.moderation_status IS NULL)
          ORDER BY t2.created_at DESC
          LIMIT 1
        ) AS latest_tip_content,
        (
          SELECT up2.username FROM tips t2
          JOIN user_profiles up2 ON t2.user_id = up2.user_id
          WHERE t2.map_location_id = ml.id
            AND (t2.moderation_status = 'approved' OR t2.moderation_status IS NULL)
          ORDER BY t2.created_at DESC
          LIMIT 1
        ) AS latest_tip_username
      FROM map_locations ml
      LEFT JOIN tips t ON t.map_location_id = ml.id
        AND (t.moderation_status = 'approved' OR t.moderation_status IS NULL)
      GROUP BY ml.id
      ORDER BY COUNT(t.id) DESC, ml.created_at DESC
    `;

    // ─── Legacy pins: tips with lat/lng but no map_location_id ──────────────
    // Group by rounding to ~50m grid (0.0005 degrees ≈ 55m)
    const legacyTips = await sql`
      SELECT
        t.id, t.title, t.content, t.category, t.venue_type,
        t.location_name, t.location_latitude, t.location_longitude,
        t.created_at,
        up.username, up.profile_image
      FROM tips t
      JOIN user_profiles up ON t.user_id = up.user_id
      WHERE t.map_location_id IS NULL
        AND t.location_latitude IS NOT NULL
        AND t.location_longitude IS NOT NULL
        AND (t.moderation_status = 'approved' OR t.moderation_status IS NULL)
      ORDER BY t.created_at DESC
      LIMIT 500
    `;

    // Client-side proximity grouping for legacy tips
    const legacyGroups = {};
    legacyTips.forEach((tip) => {
      const gridLat =
        Math.round(parseFloat(tip.location_latitude) / 0.0005) * 0.0005;
      const gridLng =
        Math.round(parseFloat(tip.location_longitude) / 0.0005) * 0.0005;
      const key = `${gridLat.toFixed(4)}_${gridLng.toFixed(4)}`;
      if (!legacyGroups[key]) {
        legacyGroups[key] = {
          id: `legacy_${key}`,
          name: tip.location_name || tip.title,
          address: null,
          latitude: gridLat,
          longitude: gridLng,
          category: tip.venue_type || tip.category || "general",
          is_legacy: true,
          tips: [],
          tip_count: 0,
          latest_tip_at: tip.created_at,
          latest_tip_content: null,
          latest_tip_username: null,
        };
      }
      legacyGroups[key].tip_count += 1;
      legacyGroups[key].tips.push(tip.id);
      if (!legacyGroups[key].latest_tip_content) {
        legacyGroups[key].latest_tip_content = tip.content;
        legacyGroups[key].latest_tip_username = tip.username;
      }
    });

    // Apply category filter if requested
    let filteredLocationPins = locationPins;
    if (category && category !== "all") {
      filteredLocationPins = locationPins.filter(
        (p) => p.category === category,
      );
    }

    let filteredLegacy = Object.values(legacyGroups);
    if (category && category !== "all") {
      filteredLegacy = filteredLegacy.filter((p) => p.category === category);
    }

    return Response.json({
      pins: filteredLocationPins,
      legacy_pins: filteredLegacy,
    });
  } catch (err) {
    console.error("GET /api/map-pins error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
