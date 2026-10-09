# Milestone 1 — Phase 2: Map Engine, Performance & UI Theme

The UI reference supplied for TipTrip uses a travel-editorial style: teal-to-mint gradient headers, dark bold headings, light gray page backgrounds, white rounded cards, restrained shadows, and compact teal accents. Shared tokens live in `src/theme/tiptripTheme.js`.

## Added in this phase

- `src/components/TipMarker.jsx`: memoized React Native Maps marker, static marker view, `tracksViewChanges={false}`, category colors, and selected state.
- `src/theme/tiptripTheme.js`: reusable palette, spacing, radii, typography, card shadow, and category colors.
- `src/theme/tipCategories.js`: 12 map filter categories.

## Integration steps

1. Confirm `react-native-maps` is installed and the app's map screen imports this component.
2. Render pins with stable IDs and stable `onPress` callbacks. Avoid creating a new callback per marker on every render.
3. Query `get_pins_in_viewport(min_lat, min_lng, max_lat, max_lng)` from the Phase 1 migration when the map region changes. Debounce region updates and cancel/ignore stale requests.
4. Apply the category filter before rendering and cache the filtered result in the app's existing state store (Zustand if already installed; do not add a second store unnecessarily).
5. Use the shared theme for Destination and Feed headers, category chips, place cards, and empty states to keep the supplied visual style consistent.
6. Verify permission and RLS behavior for public and private pins before displaying results.

## Important repository note

At the time these changes were prepared, the repository did not expose an existing `package.json`, app entry point, map screen, Feed screen, or existing `TipMarker.jsx` on the `milestone1` branch. These are therefore starter modules, not a completed refactor of an existing screen. They must be integrated with the actual app structure and its installed dependency versions before the phase can be considered complete.

## Acceptance checks

- Map panning does not continuously re-render every marker.
- Marker view tracking remains disabled for static marker content.
- Spatial viewport queries use the PostGIS index and are debounced.
- All 12 category chips filter the visible pin set without flicker.
- Destination and Feed views use the teal/mint theme, rounded white cards, and soft shadows shown in the supplied reference.
- Test with 100+ visible pins and measure query latency; target is below 100 ms for the database query under the intended test setup.
