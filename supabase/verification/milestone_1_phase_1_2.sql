-- Run this script in the Supabase SQL Editor AFTER applying both migrations.
-- It is read-only and raises an exception if required schema objects are absent.
do $$
declare
  missing text[] := array[]::text[];
  table_name text;
begin
  if not exists (select 1 from pg_extension where extname = 'postgis') then
    missing := array_append(missing, 'PostGIS extension');
  end if;

  foreach table_name in array array['profiles','destinations','map_pins','trips','saved_tips'] loop
    if to_regclass('public.' || table_name) is null then
      missing := array_append(missing, 'table public.' || table_name);
    elsif not exists (
      select 1 from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = table_name and c.relrowsecurity
    ) then
      missing := array_append(missing, 'RLS enabled on public.' || table_name);
    end if;
  end loop;

  if to_regclass('public.idx_map_pins_location') is null then
    missing := array_append(missing, 'GIST index idx_map_pins_location');
  end if;

  if to_regprocedure('public.get_pins_in_viewport(double precision,double precision,double precision,double precision)') is null then
    missing := array_append(missing, 'RPC public.get_pins_in_viewport');
  end if;

  if cardinality(missing) > 0 then
    raise exception 'TipTrip Milestone 1 verification failed: %', array_to_string(missing, ', ');
  end if;
  raise notice 'TipTrip Milestone 1 schema, RLS, index and viewport RPC checks passed.';
end $$;

-- Inspect active policy definitions. Confirm these results before launch.
select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles','destinations','map_pins','trips','saved_tips')
order by tablename, policyname;

-- Show index definitions so the spatial index can be reviewed.
select schemaname, tablename, indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and tablename in ('map_pins','destinations')
order by tablename, indexname;
