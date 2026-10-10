# TipTrip — Milestone 1, Phase 1

## Run the Expo UI scaffold

1. Install Node.js and npm, then run `npm install` in the repository root.
2. Copy `.env.example` to `.env.local` (or configure Expo public environment variables) and set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` for live data. Leave them unset to preview with sample travel tips.
3. Optionally set `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` to enable live destination geocoding. Use a public token with appropriate usage restrictions; this value is bundled into the client app.
4. Run `npm install`, `npm run verify:phase1-2`, and `npx expo start`. `react-native-maps` may require a development build for some native configurations.

The UI includes Explore, Feed, Trips, Map and Profile tabs; a teal/mint theme; 12 category filters; memoized map markers; debounced viewport RPC; optional Mapbox destination search and map camera bounds; a no-results add-tip fallback; email sign-up/sign-in; tip publishing; and saved-tip pointers into user-owned trips. It is a new scaffold because the branch did not contain an existing app entry point or package manifest when inspected.

## Included
- `App.js` and `package.json` — Expo UI scaffold and dependencies.
- `src/theme/tiptripTheme.js`, `src/theme/tipCategories.js`, `src/components/TipMarker.jsx` — shared theme, category filters and optimized marker.
- `src/services/geocoding.js` — optional Mapbox geocoding and viewport bounds.
- `src/services/tripRepository.js` — authenticated trip, tip publishing and saved-tip operations.
- `supabase/migrations/20261009000100_milestone_1_core_schema.sql`
  - PostGIS extension, core tables, indexes, viewport RPC, profile bootstrap trigger, and RLS.
- `supabase/migrations/20261009000200_viewport_rpc_coordinates.sql` — explicit viewport latitude/longitude RPC output.
- `supabase/verification/milestone_1_phase_1_2.sql` — post-migration schema/RLS/index checks.
- `supabase/verification/benchmark_map_pins.sql` — transaction-rolled-back spatial query benchmark fixture.
- `.env.example` — placeholders only; no credentials are included.

## Configure and verify
1. In Supabase Auth settings, choose your sign-up/email-confirmation behavior and configure redirect URLs for your app.
2. Apply both timestamped migrations in order. The second replaces the initial viewport RPC with an explicit-coordinate return shape.
3. Run `supabase/verification/milestone_1_phase_1_2.sql` in the Supabase SQL Editor and inspect the RLS policy output.
4. Run `supabase/verification/benchmark_map_pins.sql` in a non-production/test project to inspect `EXPLAIN ANALYZE` query timing. Its generated pins are rolled back at the end.
5. In the app, open Profile and sign up/sign in. Add a tip with valid coordinates, select it on the map, save it to a trip, and verify that the trip remains private to the signed-in user.

## Apply safely
1. Create/select the intended Supabase project and back up any existing database.
2. Confirm PostGIS is available. The migration enables it in the `extensions` schema.
3. Review the migration against the current app's expected data model before applying.
4. Apply using Supabase CLI (`supabase db push`) in a configured project, or paste into the SQL Editor.
5. Configure client code with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
6. Keep `SUPABASE_SERVICE_ROLE_KEY` on trusted server-side environments only.

## Notes
- `get_pins_in_viewport(min_lat, min_lng, max_lat, max_lng)` expects latitude/longitude bounds in degrees and uses longitude-first order for the PostGIS envelope.
- The function uses `SECURITY INVOKER`, so RLS is not bypassed.
- `saved_tips` stores pointers to existing pins instead of duplicating tip text.
- Migrations and UI have not been applied/launched against your actual Supabase project or device from this environment.
- The Supabase CLI project link, credentials, and runtime test environment were not available during preparation.
