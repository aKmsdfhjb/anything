import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    // Only return approved tips for the globe
    const tips = await sql`
      SELECT 
        t.id,
        t.title,
        t.content,
        t.category,
        t.venue_type,
        t.venue_name,
        t.best_time_to_visit,
        t.special_tips,
        t.location_name,
        t.location_latitude,
        t.location_longitude,
        t.photo_url,
        t.photo_urls,
        t.upvotes,
        t.views,
        t.engagement_score,
        t.comment_count,
        t.created_at,
        d.name as destination_name,
        d.country as destination_country,
        d.latitude as dest_latitude,
        d.longitude as dest_longitude,
        up.username,
        up.profile_image,
        up.is_verified
      FROM tips t
      JOIN destinations d ON t.destination_id = d.id
      JOIN user_profiles up ON t.user_id = up.user_id
      WHERE (t.moderation_status = 'approved' OR t.moderation_status IS NULL)
      ORDER BY t.engagement_score DESC, t.created_at DESC
      LIMIT 500
    `;

    // Get public trips for the map
    const trips = await sql`
      SELECT 
        tr.id,
        tr.trip_name,
        tr.start_date,
        tr.end_date,
        tr.notes,
        tr.status,
        tr.share_description,
        tr.created_at,
        d.name as destination_name,
        d.country as destination_country,
        d.latitude,
        d.longitude,
        up.username,
        up.profile_image,
        up.is_verified
      FROM trips tr
      JOIN destinations d ON tr.destination_id = d.id
      JOIN user_profiles up ON tr.user_id = up.user_id
      WHERE tr.is_public = true
      ORDER BY tr.start_date DESC
      LIMIT 200
    `;

    // Use destination lat/lng as fallback for tips without their own coordinates
    const enrichedTips = tips.map((tip) => ({
      ...tip,
      marker_latitude: tip.location_latitude
        ? parseFloat(tip.location_latitude)
        : parseFloat(tip.dest_latitude),
      marker_longitude: tip.location_longitude
        ? parseFloat(tip.location_longitude)
        : parseFloat(tip.dest_longitude),
      marker_type: "tip",
    }));

    // Add trips as map markers
    const enrichedTrips = trips.map((trip) => ({
      ...trip,
      marker_latitude: parseFloat(trip.latitude),
      marker_longitude: parseFloat(trip.longitude),
      marker_type: "trip",
    }));

    // Filter by category if provided
    const filtered =
      category && category !== "all"
        ? enrichedTips.filter((t) => t.category === category)
        : enrichedTips;

    // Group tips by venue (same title + same destination = same venue)
    const venueMap = {};
    filtered.forEach((tip) => {
      const key = `${tip.title.toLowerCase().trim()}_${tip.destination_name.toLowerCase().trim()}`;
      if (!venueMap[key]) {
        venueMap[key] = {
          venue_key: key,
          venue_name: tip.title,
          venue_type: tip.venue_type,
          destination_name: tip.destination_name,
          destination_country: tip.destination_country,
          latitude: tip.marker_latitude,
          longitude: tip.marker_longitude,
          location_name: tip.location_name,
          category: tip.category,
          tip_count: 0,
          tips: [],
        };
      }
      venueMap[key].tip_count += 1;
      venueMap[key].tips.push({
        id: tip.id,
        title: tip.title,
        content: tip.content,
        category: tip.category,
        venue_type: tip.venue_type,
        best_time_to_visit: tip.best_time_to_visit,
        special_tips: tip.special_tips,
        photo_url: tip.photo_url,
        username: tip.username,
        profile_image: tip.profile_image,
        is_verified: tip.is_verified,
        upvotes: tip.upvotes,
        created_at: tip.created_at,
      });
    });

    // Also group by destination for the globe clusters
    const destinationGroups = {};
    filtered.forEach((tip) => {
      const destKey = tip.destination_name;
      if (!destinationGroups[destKey]) {
        destinationGroups[destKey] = {
          destination_name: tip.destination_name,
          destination_country: tip.destination_country,
          latitude: parseFloat(tip.dest_latitude),
          longitude: parseFloat(tip.dest_longitude),
          tip_count: 0,
          recommend_count: 0,
          avoid_count: 0,
          warning_count: 0,
          venues: {},
          trip_count: 0,
        };
      }
      destinationGroups[destKey].tip_count += 1;
      if (tip.category === "recommend")
        destinationGroups[destKey].recommend_count += 1;
      else if (tip.category === "avoid")
        destinationGroups[destKey].avoid_count += 1;
      else if (tip.category === "safety_warning")
        destinationGroups[destKey].warning_count += 1;

      const venueKey = tip.title.toLowerCase().trim();
      if (!destinationGroups[destKey].venues[venueKey]) {
        destinationGroups[destKey].venues[venueKey] = {
          name: tip.title,
          venue_type: tip.venue_type,
          tip_count: 0,
        };
      }
      destinationGroups[destKey].venues[venueKey].tip_count += 1;
    });

    // Add trip counts to destination groups
    enrichedTrips.forEach((trip) => {
      const destKey = trip.destination_name;
      if (!destinationGroups[destKey]) {
        destinationGroups[destKey] = {
          destination_name: trip.destination_name,
          destination_country: trip.destination_country,
          latitude: parseFloat(trip.latitude),
          longitude: parseFloat(trip.longitude),
          tip_count: 0,
          recommend_count: 0,
          avoid_count: 0,
          warning_count: 0,
          venues: {},
          trip_count: 0,
        };
      }
      destinationGroups[destKey].trip_count += 1;
    });

    // Convert venues object to array in each destination group
    const destGroupsArray = Object.values(destinationGroups).map((dg) => ({
      ...dg,
      venues: Object.values(dg.venues),
    }));

    return Response.json({
      tips: filtered,
      trips: enrichedTrips,
      venues: Object.values(venueMap),
      destinations: destGroupsArray,
    });
  } catch (err) {
    console.error("GET /api/map-points error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
