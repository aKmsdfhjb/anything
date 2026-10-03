// Google Places autocomplete proxy
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const input = searchParams.get("input");

    if (!input || input.length < 2) {
      return Response.json({ predictions: [] });
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return Response.json({
        predictions: [],
        error: "Maps API key not configured",
      });
    }

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=establishment|geocode&key=${apiKey}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Google API returned ${res.status}`);
    }

    const data = await res.json();

    const predictions = (data.predictions || []).map((p) => ({
      place_id: p.place_id,
      description: p.description,
      main_text: p.structured_formatting?.main_text || p.description,
      secondary_text: p.structured_formatting?.secondary_text || "",
    }));

    return Response.json({ predictions });
  } catch (err) {
    console.error("GET /api/places-search error", err);
    return Response.json({ predictions: [], error: "Search failed" });
  }
}

// Get place details (lat/lng) for a selected place
export async function POST(request) {
  try {
    const body = await request.json();
    const { place_id } = body;

    if (!place_id) {
      return Response.json({ error: "place_id required" }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Maps API key not configured" },
        { status: 500 },
      );
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(place_id)}&fields=geometry,formatted_address,name&key=${apiKey}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Google API returned ${res.status}`);
    }

    const data = await res.json();
    const result = data.result;

    if (!result) {
      return Response.json({ error: "Place not found" }, { status: 404 });
    }

    return Response.json({
      name: result.name,
      address: result.formatted_address,
      latitude: result.geometry?.location?.lat || null,
      longitude: result.geometry?.location?.lng || null,
    });
  } catch (err) {
    console.error("POST /api/places-search error", err);
    return Response.json(
      { error: "Failed to get place details" },
      { status: 500 },
    );
  }
}

// Reverse geocode — convert lat/lng to address
export async function PUT(request) {
  try {
    const body = await request.json();
    const { latitude, longitude } = body;

    if (latitude === undefined || longitude === undefined) {
      return Response.json(
        { error: "latitude and longitude required" },
        { status: 400 },
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Maps API key not configured" },
        { status: 500 },
      );
    }

    const coordsFallback = `${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}`;

    // Try Geocoding API first
    try {
      const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
      const geoRes = await fetch(geoUrl);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (
          geoData.status === "OK" &&
          geoData.results &&
          geoData.results.length > 0
        ) {
          return Response.json({
            address: geoData.results[0].formatted_address,
            place_id: geoData.results[0].place_id,
          });
        }
      }
    } catch (geoErr) {
      // Geocoding API failed, try fallback
    }

    // Fallback: try Places Nearby Search
    try {
      const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=50&key=${apiKey}`;
      const nearbyRes = await fetch(nearbyUrl);
      if (nearbyRes.ok) {
        const nearbyData = await nearbyRes.json();
        if (
          nearbyData.status === "OK" &&
          nearbyData.results &&
          nearbyData.results.length > 0
        ) {
          const place = nearbyData.results[0];
          const address = place.vicinity || place.name || coordsFallback;
          return Response.json({
            address: address,
            place_id: place.place_id,
          });
        }
      }
    } catch (nearbyErr) {
      // Nearby search also failed
    }

    // Final fallback: just return coordinates
    return Response.json({ address: coordsFallback });
  } catch (err) {
    console.error("PUT /api/places-search error", err);
    return Response.json(
      { error: "Reverse geocoding failed" },
      { status: 500 },
    );
  }
}
