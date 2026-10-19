// OpenStreetMap Nominatim geocoding adapter (no API token required for compliant use).
// Read and follow https://operations.osmfoundation.org/policies/nominatim/ before production use.
// Public Nominatim is not an unlimited autocomplete API; call only after a user submits a search.
const ENDPOINT = 'https://nominatim.openstreetmap.org/search';

const toRegion = (latitude, longitude, bounds) => {
  const [south, north, west, east] = Array.isArray(bounds) ? bounds.map(Number) : [];
  return {
    latitude,
    longitude,
    latitudeDelta: Number.isFinite(south) && Number.isFinite(north) ? Math.min(160, Math.max(0.02, Math.abs(north - south) * 1.35)) : 0.18,
    longitudeDelta: Number.isFinite(west) && Number.isFinite(east) ? Math.min(160, Math.max(0.02, Math.abs(east - west) * 1.35)) : 0.18,
  };
};

export async function searchDestinationsNominatim(query, { signal } = {}) {
  const normalized = String(query || '').trim();
  if (normalized.length < 2) return [];
  const url = new URL(ENDPOINT);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('q', normalized);
  url.searchParams.set('limit', '6');
  url.searchParams.set('addressdetails', '1');
  const response = await fetch(url.toString(), { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Destination search failed (${response.status})`);
  const payload = await response.json();
  return (payload || []).map(item => {
    const latitude = Number(item.lat);
    const longitude = Number(item.lon);
    const title = item.name || item.display_name?.split(',')[0] || normalized;
    return {
      id: String(item.place_id),
      title,
      country: item.address?.country || '',
      placeName: item.display_name || title,
      center: [longitude, latitude],
      bbox: item.boundingbox,
      region: toRegion(latitude, longitude, item.boundingbox),
      source: 'openstreetmap-nominatim',
    };
  }).filter(item => Number.isFinite(item.region.latitude) && Number.isFinite(item.region.longitude));
}

export function destinationRegionNominatim(destination) {
  if (destination?.region) return destination.region;
  const [longitude, latitude] = destination?.center || [];
  if (Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))) {
    return { latitude: Number(latitude), longitude: Number(longitude), latitudeDelta: 0.18, longitudeDelta: 0.18 };
  }
  return null;
}
