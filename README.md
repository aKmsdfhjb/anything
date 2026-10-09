# TipTrip — Milestone 1, Phase 1

## Run the Expo UI scaffold

1. Install Node.js and npm, then run `npm install` in the repository root.
2. Copy `.env.example` to `.env.local` (or configure Expo public environment variables) and set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` for live data. Leave them unset to preview with sample travel tips.
3. Run `npx expo start` and open the project in Expo Go or a configured simulator. `react-native-maps` may require a development build for some native configurations.

The starter UI includes Explore, Feed, Trips, Map and Profile tabs, a teal/mint theme, 12 category filters, memoized map markers, and a debounced viewport RPC call. It is a new scaffold because the branch did not contain an existing app entry point or package manifest when inspected.

## Included
- `App.js` and `package.json` — Expo UI scaffold and dependencies.
- `src/theme/tiptripTheme.js`, `src/theme/tipCategories.js`, `src/components/TipMarker.jsx` — shared theme, category filters and optimized marker.
- `supabase/migrations/20261009000100_milestone_1_core_schema.sql`
  - PostGIS extension, core tables, indexes, viewport RPC, profile bootstrap trigger, and RLS.
- `.env.example`
  - Placeholder environment variables only; no credentials are included.

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
- This migration has not been applied to a live Supabase project and has not been integration-tested against the app yet.
- The Supabase CLI project link, credentials, and runtime test environment were not available during preparation.
