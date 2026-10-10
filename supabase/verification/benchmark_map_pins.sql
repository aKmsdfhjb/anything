-- Run only in a development/test Supabase project after both migrations.
-- Generates 1,000 representative pins, shows the viewport query plan/timing,
-- and rolls the generated rows back. Does not commit fixture rows.
begin;

insert into public.map_pins
  (user_id, title, description, category, location, country_code, city, visibility, status)
select
  null,
  'Milestone benchmark pin ' || g,
  'Temporary row for spatial query timing; rolled back below.',
  (array['food','hotel','nature','viewpoints','transportation','general'])[((g - 1) % 6) + 1],
  extensions.st_setsrid(
    extensions.st_makepoint(
      114.0 + random() * 0.35,
      22.1 + random() * 0.35
    ),
    4326
  )::extensions.geography,
  'HK',
  'Hong Kong',
  'public',
  'active'
from generate_series(1, 1000) as g;

analyze public.map_pins;

explain (analyze, buffers, verbose)
select p.id, p.title,
       extensions.st_y(p.location::extensions.geometry) as latitude,
       extensions.st_x(p.location::extensions.geometry) as longitude
from public.map_pins p
where p.status = 'active'
  and p.visibility = 'public'
  and extensions.st_intersects(
    p.location,
    extensions.st_makeenvelope(114.05, 22.15, 114.25, 22.35, 4326)::extensions.geography
  );

rollback;

-- Review Planning Time, Execution Time and whether idx_map_pins_location is used.
-- The exact result depends on database size, cache state, region and project tier;
-- do not report the <100 ms target as met until measured on representative data.
