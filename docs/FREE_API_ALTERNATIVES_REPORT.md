# TipTrip — Free API Alternatives Report

**Date:** 19 October 2026  
**Branch:** `milestone-1-alternative`

## Summary

The current project uses optional Mapbox Geocoding for destination search and React Native Maps with an Android Google Maps API key for native map rendering. These are separate integrations: replacing geocoding does not remove the native map SDK requirement.

## Recommended options

| Area | Current setup | Cost-conscious option | Important limits |
|---|---|---|---|
| Destination search | Optional Mapbox geocoding token | OpenStreetMap Nominatim public geocoder | Must comply with the current usage policy; avoid frequent autocomplete requests and do not treat the public endpoint as unlimited production infrastructure. |
| Map rendering | `react-native-maps`; Android configured with `GOOGLE_MAPS_API_KEY` | Evaluate MapLibre Native plus a suitably licensed OSM-derived style/tile provider | Requires a deliberate native renderer migration, attribution, provider review, and iOS/Android build testing. Not a one-line API-key swap. |
| Database | Supabase URL + anon/publishable key and PostGIS migrations | Use an available free development tier or self-host PostgreSQL/PostGIS | Free-tier limits and operations costs can change. Never put the Supabase service-role key in the client. |
| Future affiliate links | Not confirmed as implemented in Milestone 1 | Select providers with free access where available, or use ordinary tracked links where allowed | Provider approval, commercial terms, attribution, and commissions vary. |

## Migration plan

1. Replace Mapbox geocoding with Nominatim only with compliant request pacing and attribution. Avoid keystroke-by-keystroke requests; use user-triggered searches and a conservative debounce.
2. Treat map rendering as a separate engineering task: migrate to MapLibre Native with an appropriate tile/style provider, or retain Google Maps with restricted credentials and billing controls. Do not promise that Google Maps is guaranteed free.
3. Keep secrets server-side. The mobile client should only receive the Supabase URL and anon/publishable key.
4. Test Android and iOS builds, search, map load, attribution, panning, markers, error states, and request limits.
5. Capture actual verification logs: dependency install, static verification, Expo bundle/build, end-to-end flows, and performance tests with representative marker counts.

## Validation status

This document is a planning report, not proof that all paid/key-based integrations have already been removed. The current repository configuration still identifies `GOOGLE_MAPS_API_KEY` for Android. A complete zero-key map renderer requires further code changes and device testing. `package.json` has a `verify:milestone1` static verification script but does not define an npm `test` or build script. No live database migration, native build, device test, or performance benchmark is claimed as passed here.

## Provider references

- Nominatim usage policy: https://operations.osmfoundation.org/policies/nominatim/
- MapLibre: https://maplibre.org/
