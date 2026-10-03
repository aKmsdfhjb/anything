import sql from "@/app/api/utils/sql";

// Build affiliate booking URLs for a destination
// GET /api/affiliates/links?destination=Paris&country=France&category=hotels
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const destination = searchParams.get("destination") || "";
    const country = searchParams.get("country") || "";
    const category = searchParams.get("category"); // optional filter

    let partners;
    if (category) {
      partners = await sql`
        SELECT * FROM affiliate_partners
        WHERE is_active = true AND category = ${category}
        ORDER BY commission_rate DESC, partner_name ASC
      `;
    } else {
      partners = await sql`
        SELECT * FROM affiliate_partners
        WHERE is_active = true
        ORDER BY category, commission_rate DESC, partner_name ASC
      `;
    }

    const links = partners.map((partner) => {
      const bookingUrl = buildBookingUrl(partner, destination, country);
      return {
        id: partner.id,
        partner_name: partner.partner_name,
        partner_slug: partner.partner_slug,
        category: partner.category,
        description: partner.description,
        commission_rate: parseFloat(partner.commission_rate),
        has_affiliate_code: !!partner.affiliate_code,
        booking_url: bookingUrl,
        signup_url: partner.affiliate_signup_url,
        base_url: partner.base_url,
      };
    });

    return Response.json({ links });
  } catch (err) {
    console.error("GET /api/affiliates/links error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function buildBookingUrl(partner, destination, country) {
  const dest = encodeURIComponent(destination);
  const fullDest = encodeURIComponent(`${destination}, ${country}`);
  const slug = partner.partner_slug;
  const code = partner.affiliate_code;

  // Build deep search URLs for each partner
  switch (slug) {
    // === FLIGHTS ===
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

    // === HOTELS ===
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

    // === ACTIVITIES ===
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

    // === CAR RENTAL ===
    case "rentalcars": {
      const url = `https://www.rentalcars.com/search-results?location=${fullDest}`;
      return code ? `${url}&affiliateCode=${code}` : url;
    }
    case "discover-cars": {
      const url = `https://www.discovercars.com/search?location=${fullDest}`;
      return code ? `${url}&a_aid=${code}` : url;
    }

    // === INSURANCE ===
    case "world-nomads": {
      const url = `https://www.worldnomads.com/travel-insurance/get-a-quote`;
      return code ? `${url}?affiliate=${code}` : url;
    }
    case "safetywing": {
      const url = `https://safetywing.com/nomad-insurance`;
      return code ? `${url}?referenceID=${code}` : url;
    }

    // === MULTI ===
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
