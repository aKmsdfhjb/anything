# TipTrip — Milestone 1 Client Handover Guide

**Project:** TipTrip (social travel and map-pinning app)  
**Code branch:** `milestone1`  
**Repository:** https://github.com/aKmsdfhjb/anything  
**Purpose:** Help Lee complete the client-side setup and review the implementation after developer handover.

## 1. Current status — please read first

The Milestone 1 implementation files and setup instructions are committed on the `milestone1` branch. Static repository-content checks were performed. **The live Supabase database has not been provisioned or migrated by this handover, and real-device flows, live authorization, query latency, and CI success must still be confirmed.**

This guide separates code that has been prepared from actions requiring the client's accounts, credentials, or approval. Do not treat static checks as proof that the live application works end-to-end.

## 2. What you need

- Access to the GitHub repository and the `milestone1` branch.
- A Supabase account and a project for TipTrip.
- An Android/iOS test device or simulator and Expo-compatible development environment.
- A Google Maps API key configured for the relevant native platform.
- Optional: a Mapbox **public** access token for destination geocoding.
- Node.js/npm installed on the machine used to run the app.

## 3. Security rules for credentials

- Never commit `.env.local`, `.env`, passwords, or private keys.
- Never put the Supabase `service_role` key in the Expo client app, screenshots, GitHub, or chat. It bypasses normal Row-Level Security protections.
- The app should use the Supabase project URL and anon/publishable key only.
- Restrict the Google Maps key to the required APIs and app identity (package/bundle ID and signing certificate where applicable).
- A Mapbox public token is intended for client-side use, but should still have suitable scope and URL restrictions where supported.
- Share secrets through an approved secure channel only.

## 4. Create/configure Supabase

1. Sign in to Supabase and create a project or select the intended TipTrip project.
2. Save the database password in a secure password manager; do not commit it.
3. In **Project Settings → API** (menu labels may change), locate the project URL and anon/publishable key.
4. In **Authentication**, enable the intended sign-in method (email/password is used by the current UI). Configure email confirmation and redirect URLs to match your test environment.
5. Keep the service-role/secret key private.

### Apply database migrations in order

Before applying migrations to a project containing data, create a backup and confirm the target project is correct.

From the repository's `milestone1` branch, apply these files **in this order** using Supabase CLI linked to the correct project or the Supabase SQL Editor:

1. `supabase/migrations/20261009000100_milestone_1_core_schema.sql`
2. `supabase/migrations/20261009000200_viewport_rpc_coordinates.sql`

If using the SQL Editor, open each file, paste/run the full contents, and inspect any error output before proceeding to the next file. Do not continue after a migration error until it has been resolved. If using the CLI, first verify the linked project reference and follow Supabase's migration workflow; do not blindly push to a production project.

Then run:

- `supabase/verification/milestone_1_phase_1_2.sql`

Review the results and verify the expected tables, viewport function and RLS policies exist. In particular, confirm that authenticated users can only read/manage their own private trips and saved-trip relationships, according to the policies in the migration.

## 5. Configure local environment and map keys

1. Clone the repository and check out `milestone1`.
2. Copy `.env.example` to `.env.local` (or the environment-file convention used by your Expo setup).
3. Set the Supabase project URL and anon/publishable key in the expected `EXPO_PUBLIC_*` variables. Do not add the service-role key.
4. Set `GOOGLE_MAPS_API_KEY` to a restricted key for Android native map rendering. Follow the project's Expo configuration and the relevant platform instructions for iOS if you test iOS.
5. Optional: set `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` to a restricted Mapbox public token for geocoding.

The exact environment variable names are documented in `.env.example`. Restart Expo after changing environment variables.

## 6. Install and launch

Run in the repository root:

```bash
git checkout milestone1
npm install
npm run verify:milestone1
npx expo start
```

Open the project on a supported device or simulator. If the acceptance command or Expo bundle fails, capture the complete error output and fix it before sign-off. The static acceptance command checks repository patterns; it does not replace live database, authorization, or device testing.

## 7. End-to-end acceptance checklist

### Authentication
- [ ] Create a new test account.
- [ ] Complete email confirmation if enabled.
- [ ] Sign in and sign out.
- [ ] Verify expected behavior for invalid credentials and signed-out access.

### Destination search and map
- [ ] Search for Hong Kong, Rhodes, and Bali.
- [ ] Select each result and verify the map animates to the intended destination.
- [ ] Search for a place with no results and test the “Don't See Your Place?” fallback.
- [ ] Verify map tiles/markers display on the target device and no API-key restriction errors occur.

### Tips and trips
- [ ] Publish a test tip with a title, category and valid coordinates.
- [ ] Verify its marker appears at the expected location.
- [ ] Save a public tip to a trip.
- [ ] Open the Trips tab and confirm the saved tip appears.
- [ ] Confirm the trip is still present after app reload/sign-in.

### Row-Level Security
- [ ] Create a second test user.
- [ ] Confirm user B cannot read or modify user A's private trips or saved-trip links.
- [ ] Confirm normal public-tip visibility follows the intended policies.
- [ ] Do not use real personal data for these tests.

## 8. Performance verification

Run `supabase/verification/benchmark_map_pins.sql` **only in a test/development project**. The script generates sample pins and rolls them back; inspect the SQL before execution and do not run an unfamiliar benchmark against production without approval.

Record:
- Date and environment (project region, test dataset size).
- Query plan, whether the spatial GIST index is used, and measured execution time.
- Whether the viewport query meets the intended **under 100 ms** target under the tested conditions.
- Device/platform, number of visible markers, and observations while panning/zooming with 100+ markers.

Do not claim the latency target or smooth 100+ marker behavior is achieved until measured. Results depend on region, data, device, network and test conditions.

## 9. GitHub Actions and release check

1. Open the repository's **Actions** tab.
2. Select the Milestone 1 verification workflow.
3. Confirm the latest run for the `milestone1` branch completed successfully.
4. If it fails, open the failing job and retain the relevant logs. A committed workflow is not proof that it has passed.
5. Review the code diff on `milestone1` and confirm the intended files are present.

## 10. Handover record

Complete this section before accepting/releasing the milestone:

- Supabase project provisioned: Yes / No
- Migrations applied in order: Yes / No
- SQL verification results reviewed: Yes / No
- Auth and two-user RLS tests passed: Yes / No
- Map search and fallback tests passed: Yes / No
- Tip publishing and save-to-trip tests passed: Yes / No
- Expo launch/build passed: Yes / No
- GitHub Actions passed: Yes / No
- Spatial benchmark result and test conditions: ____________________
- 100+ marker device test result: ____________________
- Remaining issues: ____________________
- Reviewed/approved by and date: ____________________

## 11. Useful repository files

- `README.md` — setup and project overview.
- `.env.example` — environment variable names/placeholders.
- `supabase/migrations/` — ordered database migrations.
- `supabase/verification/milestone_1_phase_1_2.sql` — schema/RLS verification.
- `supabase/verification/benchmark_map_pins.sql` — test-project spatial benchmark.
- `scripts/verify-phase-1-2.mjs` — static acceptance checks.
- `.github/workflows/milestone1-verification.yml` — CI workflow.
- `docs/milestone-1-phase-1-2-self-verification.md` — implementation checklist and status notes.

## Completion definition

Milestone 1 should be described as **implemented, pending client environment setup and runtime acceptance** until the migrations have run successfully, end-to-end flows and two-user RLS tests pass, the benchmark has been measured, and the CI workflow has succeeded.
