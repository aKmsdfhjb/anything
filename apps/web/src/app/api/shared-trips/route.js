import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// GET - browse public shared trips, or get a specific trip by share code
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Single trip by share code — return full itinerary + affiliate links
    if (code) {
      const trips = await sql`
        SELECT 
          t.id, t.trip_name, t.start_date, t.end_date, t.notes, t.status,
          t.share_description, t.public_share_code, t.created_at,
          d.id as destination_id, d.name as destination_name, d.country,
          d.image_url, d.latitude, d.longitude,
          up.username, up.profile_image, up.is_verified
        FROM trips t
        JOIN destinations d ON t.destination_id = d.id
        LEFT JOIN user_profiles up ON t.user_id = up.user_id
        WHERE t.public_share_code = ${code} AND t.is_public = true
      `;

      if (trips.length === 0) {
        return Response.json({ error: "Trip not found" }, { status: 404 });
      }

      const trip = trips[0];

      // Get itinerary items
      const items = await sql`
        SELECT 
          ii.id, ii.day_number, ii.title, ii.description,
          ii.start_time, ii.end_time, ii.location_name,
          ii.category, ii.sort_order
        FROM itinerary_items ii
        WHERE ii.trip_id = ${trip.id}
        ORDER BY ii.day_number ASC, ii.sort_order ASC, ii.start_time ASC
      `;

      // Get affiliate links for this destination
      const partners = await sql`
        SELECT * FROM affiliate_partners
        WHERE is_active = true
        ORDER BY category, commission_rate DESC
      `;

      const affiliateLinks = partners.map((partner) => ({
        id: partner.id,
        partner_name: partner.partner_name,
        partner_slug: partner.partner_slug,
        category: partner.category,
        booking_url: buildBookingUrl(
          partner,
          trip.destination_name,
          trip.country,
        ),
      }));

      return Response.json({ trip, items, affiliateLinks });
    }

    // Browse all public trips
    const trips = await sql(
      `SELECT 
        t.id, t.trip_name, t.start_date, t.end_date, t.notes, t.status,
        t.share_description, t.public_share_code, t.created_at,
        d.name as destination_name, d.country, d.image_url,
        up.username, up.profile_image, up.is_verified,
        (SELECT COUNT(*) FROM itinerary_items ii WHERE ii.trip_id = t.id) as item_count,
        (SELECT COUNT(DISTINCT ii.day_number) FROM itinerary_items ii WHERE ii.trip_id = t.id) as day_count
      FROM trips t
      JOIN destinations d ON t.destination_id = d.id
      LEFT JOIN user_profiles up ON t.user_id = up.user_id
      WHERE t.is_public = true AND t.status = 'completed'
      ORDER BY t.created_at DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    return Response.json({ trips });
  } catch (err) {
    console.error("GET /api/shared-trips error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST - publish a trip publicly (owner only)
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { trip_id, share_description } = body;

    if (!trip_id) {
      return Response.json({ error: "Missing trip_id" }, { status: 400 });
    }

    // Verify ownership
    const trips = await sql`
      SELECT id, public_share_code FROM trips
      WHERE id = ${trip_id} AND user_id = ${session.user.id}
    `;

    if (trips.length === 0) {
      return Response.json({ error: "Trip not found" }, { status: 404 });
    }

    // Generate share code if not exists
    const shareCode =
      trips[0].public_share_code ||
      Math.random().toString(36).substring(2, 10) +
        Math.random().toString(36).substring(2, 6);

    const result = await sql`
      UPDATE trips 
      SET is_public = true, 
          public_share_code = ${shareCode},
          share_description = ${share_description || null}
      WHERE id = ${trip_id} AND user_id = ${session.user.id}
      RETURNING id, public_share_code, is_public
    `;

    return Response.json({ trip: result[0] }, { status: 201 });
  } catch (err) {
    console.error("POST /api/shared-trips error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE - unpublish a trip
export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get("trip_id");

    if (!tripId) {
      return Response.json({ error: "Missing trip_id" }, { status: 400 });
    }

    await sql`
      UPDATE trips SET is_public = false
      WHERE id = ${tripId} AND user_id = ${session.user.id}
    `;

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/shared-trips error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Clone a shared trip into the current user's account
export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { share_code, trip_name, start_date } = body;

    if (!share_code) {
      return Response.json({ error: "Missing share_code" }, { status: 400 });
    }

    // Find the source trip
    const source = await sql`
      SELECT t.* FROM trips t 
      WHERE t.public_share_code = ${share_code} AND t.is_public = true
    `;

    if (source.length === 0) {
      return Response.json({ error: "Trip not found" }, { status: 404 });
    }

    const srcTrip = source[0];

    // Create the cloned trip
    const newTrip = await sql`
      INSERT INTO trips (user_id, destination_id, trip_name, start_date, end_date, notes, status)
      VALUES (
        ${session.user.id},
        ${srcTrip.destination_id},
        ${trip_name || srcTrip.trip_name + " (copied)"},
        ${start_date || srcTrip.start_date},
        ${srcTrip.end_date || null},
        ${srcTrip.notes || null},
        'planned'
      )
      RETURNING *
    `;

    // Clone all itinerary items
    const srcItems = await sql`
      SELECT day_number, title, description, start_time, end_time,
             location_name, category, sort_order
      FROM itinerary_items
      WHERE trip_id = ${srcTrip.id}
      ORDER BY day_number, sort_order
    `;

    for (const item of srcItems) {
      await sql`
        INSERT INTO itinerary_items (trip_id, user_id, day_number, title, description, start_time, end_time, location_name, category, sort_order)
        VALUES (
          ${newTrip[0].id}, ${session.user.id}, ${item.day_number},
          ${item.title}, ${item.description}, ${item.start_time},
          ${item.end_time}, ${item.location_name}, ${item.category}, ${item.sort_order}
        )
      `;
    }

    return Response.json({ trip: newTrip[0], items_cloned: srcItems.length });
  } catch (err) {
    console.error("PUT /api/shared-trips error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function buildBookingUrl(partner, destination, country) {
  const dest = encodeURIComponent(destination);
  const fullDest = encodeURIComponent(`${destination}, ${country}`);
  const slug = partner.partner_slug;
  const code = partner.affiliate_code;

  switch (slug) {
    case "skyscanner": {
      const url = `https://www.skyscanner.net/transport/flights-to/${dest.toLowerCase()}/`;
      return code ? `${url}?associateid=${code}` : url;
    }
    case "google-flights":
      return `https://www.google.com/travel/flights?q=flights+to+${dest}`;
    case "kiwi": {
      const url = `https://www.kiwi.com/en/search/anywhere/${dest}`;
      return code ? `${url}?affilid=${code}` : url;
    }
    case "booking": {
      const url = `https://www.booking.com/searchresults.html?ss=${fullDest}`;
      return code ? `${url}&aid=${code}` : url;
    }
    case "trivago": {
      const url = `https://www.trivago.com/en-US/srl?search=${fullDest}`;
      return code ? `${url}&cpt2=${code}` : url;
    }
    case "hotels-com": {
      const url = `https://www.hotels.com/search.do?q-destination=${fullDest}`;
      return code ? `${url}&rffrid=${code}` : url;
    }
    case "hostelworld": {
      const url = `https://www.hostelworld.com/s?q=${fullDest}`;
      return code ? `${url}&affiliate=${code}` : url;
    }
    case "airbnb": {
      const url = `https://www.airbnb.com/s/${dest}/homes`;
      return code ? `${url}?af=${code}` : url;
    }
    case "getyourguide": {
      const url = `https://www.getyourguide.com/s/?q=${fullDest}`;
      return code ? `${url}&partner_id=${code}` : url;
    }
    case "viator": {
      const url = `https://www.viator.com/searchResults/all?text=${fullDest}`;
      return code ? `${url}&pid=${code}` : url;
    }
    case "klook": {
      const url = `https://www.klook.com/en-US/search/?query=${fullDest}`;
      return code ? `${url}&aid=${code}` : url;
    }
    case "rentalcars": {
      const url = `https://www.rentalcars.com/search-results?location=${fullDest}`;
      return code ? `${url}&affiliateCode=${code}` : url;
    }
    case "discover-cars": {
      const url = `https://www.discovercars.com/search?location=${fullDest}`;
      return code ? `${url}&a_aid=${code}` : url;
    }
    case "world-nomads": {
      const url = `https://www.worldnomads.com/travel-insurance/get-a-quote`;
      return code ? `${url}?affiliate=${code}` : url;
    }
    case "safetywing": {
      const url = `https://safetywing.com/nomad-insurance`;
      return code ? `${url}?referenceID=${code}` : url;
    }
    case "tripadvisor": {
      const url = `https://www.tripadvisor.com/Search?q=${fullDest}`;
      return code ? `${url}&m=${code}` : url;
    }
    case "expedia": {
      const url = `https://www.expedia.com/Hotel-Search?destination=${fullDest}`;
      return code ? `${url}&AFFCID=${code}` : url;
    }
    case "rome2rio": {
      const url = `https://www.rome2rio.com/s/Anywhere/${dest}`;
      return code ? `${url}?aff=${code}` : url;
    }
    default:
      return partner.base_url;
  }
}
