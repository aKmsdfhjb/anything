# TipTrip Milestone 1 — Phase 1 & 2 Verification

Branch: `milestone1`

## Implemented in the branch

### Phase 1 — Database/schema assets
- PostGIS extension declaration and `GEOGRAPHY(POINT, 4326)` map-pin storage.
- `profiles`, `destinations`, `map_pins`, `trips`, and `saved_tips` tables.
- GIST indexes for map-pin locations and destination bounds; supporting lookup indexes.
- Updated-at and new-auth-user profile triggers.
- RLS enabled on all five tables with owner/public policies.
- Viewport RPC with explicit latitude/longitude output and SECURITY INVOKER.
- Read-only SQL verification script at `supabase/verification/milestone_1_phase_1_2.sql`.

### Phase 2 — Map engine/UI assets
- Expo app scaffold with Explore, Feed, Trips, Map and Profile tabs.
- Teal/mint shared theme and card styles matching the supplied references.
- Memoized map markers with `tracksViewChanges={false}`.
- 12 category definitions and category filtering.
- Zustand store for pin caching and category state.
- Debounced viewport loads and stale-response guards.
- Node static acceptance checks in `scripts/verify-phase-1-2.mjs` and npm script `npm run verify:phase1-2`.
- GitHub Actions workflow runs those static checks on pushes and pull requests to `milestone1`.

## Verification performed in this session

The repository files were fetched back from the `milestone1` branch after committing. An independent static check against those fetched contents passed **18/18 checks**, covering required tables, geography storage, GIST index, RLS declarations, viewport RPC shape/index-compatible geography predicate, marker memoization, static marker tracking, theme tokens, categories, Zustand dependency/use, debouncing, stale-response protection, and app tabs.

## Not verified / external prerequisites

These cannot honestly be marked complete from repository access alone:
- A real Supabase project has not been provisioned or connected; no project URL or credentials were available.
- SQL migrations have not been applied to a live Postgres/PostGIS instance.
- RLS policies have not been tested with actual anon, authenticated, owner, and non-owner sessions.
- The Expo bundle has not been installed/built/launched in a simulator or device.
- Native map panning/zooming has not been benchmarked with 100+ pins.
- The expected <100 ms database latency has not been measured.

## Final acceptance steps

1. Configure the intended Supabase project and environment variables securely. Never commit a service-role key.
2. Apply both timestamped migrations in order.
3. Run `supabase/verification/milestone_1_phase_1_2.sql` in the Supabase SQL Editor and inspect the returned RLS policies.
4. Run `npm install`, `npm run verify:phase1-2`, and `npx expo start` from a checkout of this branch.
5. Test public/private read/write cases and measure viewport-query latency on realistic pin data.
6. Record the CI run and device benchmark before calling the milestone fully accepted.

Static checks are not a substitute for a live database migration, device test, or performance benchmark.
