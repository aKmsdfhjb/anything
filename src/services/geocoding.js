const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;

const asRegion = feature => {
  const center = feature?.center;
  if (!Array.isArray(center) || center.length < 2) return null;
  const [longitude, latitude] = center.map(Number);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  const bbox = Array.isArray(feature.bbox) && feature.bbox.length === 4
    ? feature.bbox.map(Number)
    : null;
  const latitudeDelta = bbox
    ? Math.max(0.02, Math.abs(bbox[3] - bbox[1]) * 1.35)
    : 0.18;
  const longitudeDelta = bbox
    ? Math.max(0.02, Math.abs(bbox[2] - bbox[0]) * 1.35)
    : 0.18;
  return {
    latitude,
    longitude,
    latitudeDelta: Math.min(160, latitudeDelta),
    longitudeDelta: Math.min(160, longitudeDelta),
  };
};

export async function searchDestinations(query, { signal } = {}) {
  const normalized = String(query || '').trim();
  if (normalized.length < 2 || !MAPBOX_TOKEN) return [];
  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(normalized)}.json`
  );
  url.searchParams.set('access_token', MAPBOX_TOKEN);
  url.searchParams.set('types', 'country,region,place,locality');
  url.searchParams.set('limit', '6');
  url.searchParams.set('autocomplete', 'true');
  const response = await fetch(url.toString(), { signal });
  if (!response.ok) throw new Error(`Geocoding request failed (${response.status})`);
  const payload = await response.json();
  return (payload.features || []).map(feature => ({
    id: feature.id,
    title: feature.text || feature.place_name,
    country: (feature.context || []).find(x => x.id?.startsWith('country'))?.text || '',
    placeName: feature.place_name || feature.text || normalized,
    center: feature.center,
    bbox: feature.bbox,
    region: asRegion(feature),
    source: 'mapbox',
  })).filter(item => item.region);
}

export function destinationRegion(destination) {
  if (destination?.region) return destination.region;
  const [longitude, latitude] = destination?.center || [];
  if (Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))) {
    return { latitude: Number(latitude), longitude: Number(longitude), latitudeDelta: 0.18, longitudeDelta: 0.18 };
  }
  return null;
}
