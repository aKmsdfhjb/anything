# TipTrip Milestone 1 — Implementation and Acceptance Checklist

Branch: `milestone1`

## Phase 1 — Database provisioning and schema

- [x] PostGIS extension declaration and `GEOGRAPHY(POINT, 4326)` map-pin storage.
- [x] `profiles`, `destinations`, `map_pins`, `trips`, and `saved_tips` tables.
- [x] Spatial GIST indexes and supporting lookup indexes.
- [x] Updated-at and new-auth-user profile triggers.
- [x] RLS enabled on all five core tables, with owner/public policies.
- [x] Viewport RPC uses SECURITY INVOKER and returns explicit latitude/longitude.
- [x] Post-migration SQL verification script.
- [x] Rollback-safe 1,000-pin spatial query benchmark script.

## Phase 2 — Map engine and performance

- [x] Expo app with Explore, Feed, Trips, Map and Profile tabs.
- [x] Teal/mint shared theme with 16px card radius.
- [x] Memoized map markers and `tracksViewChanges={false}`.
- [x] Twelve category definitions and category filters.
- [x] Zustand store for marker data/category state.
- [x] Debounced viewport requests and stale-response protection.
- [x] Camera animation to selected destination bounds.
- [ ] Device-level pan/zoom benchmark with 100+ visible pins.
- [ ] Live spatial query latency measured against the <100ms target.

## Phase 3 — Destination search and tip-to-trip flow

- [x] Optional Mapbox geocoding for country/region/place lookups.
- [x] Derive map region deltas from geocoder bounding boxes.
- [x] Search results navigate/animate to the chosen destination.
- [x] “Don't see your place?” fallback on empty search/map results.
- [x] Add-a-tip modal with title, description, category and coordinate validation.
- [x] Supabase email sign-up/sign-in and sign-out UI.
- [x] Tip creation writes a geography point to `map_pins`.
- [x] Save-tip pointer uses `saved_tips(trip_id, map_pin_id)`; trip cards display saved tips.

## Phase 4 — UI, testing and handover

- [x] Teal/mint gradient headers, rounded cards and clean typography.
- [x] Environment template and gitignore to avoid committing local secrets.
- [x] Static acceptance script: `npm run verify:milestone1`.
- [x] GitHub Actions workflow runs acceptance checks and an Expo Android JS bundle.
- [x] README with setup and acceptance instructions.
- [x] This handover checklist.
- [ ] Run the GitHub Actions workflow and confirm it passes.
- [ ] Apply migrations to the intended Supabase project.
- [ ] Run SQL verification and inspect policies.
- [ ] Test auth, owner/non-owner RLS cases, tip creation and save-to-trip on a real backend.
- [ ] Launch on Expo Go/development build and test iOS/Android map behavior.
- [ ] Record query timing and UI performance results.
- [ ] Send the tested code and results to Lee for milestone review/approval.

## Self-verification performed in this session

I fetched the committed branch files back from GitHub and ran **28 independent static acceptance checks; all 28 passed**. These checks inspect repository content for schema objects, spatial indexing, RLS declarations, viewport RPC shape, map-marker optimization, categories, Zustand, debouncing, geocoding, fallback UI, camera animation, tip creation, trip pointers, authentication controls, benchmark SQL, environment placeholders and CI configuration.

This result verifies file content and expected code patterns only. It does not prove that SQL executes against a real Supabase database, that the Expo bundle succeeds, or that runtime authorization/performance requirements pass.

## Remaining owner actions

1. Create/select the Supabase project and copy its URL and anon/publishable key into local environment configuration. Never expose the service-role key in the app.
2. Configure Supabase Auth email-confirmation and redirect settings for the app.
3. Apply `20261009000100_milestone_1_core_schema.sql` and then `20261009000200_viewport_rpc_coordinates.sql` in order.
4. Run `supabase/verification/milestone_1_phase_1_2.sql` and review the returned RLS policies.
5. Set a restricted Mapbox public token if live geocoding is required.
6. Run `npm install`, `npm run verify:milestone1`, and `npx expo start`.
7. Sign up/sign in, publish a test tip, save it to a trip, verify it appears in Trips, and verify a different account cannot read that private trip.
8. Run `supabase/verification/benchmark_map_pins.sql` in a test project, record the query plan/timing, and test panning/zooming with 100+ visible markers.
9. Confirm the GitHub Actions run passes and send the final review summary to Lee.

**Status:** Implementation files and static checks are committed to `milestone1`. External Supabase setup, real-device testing, benchmark measurements and final approval remain open and are not represented as complete.
