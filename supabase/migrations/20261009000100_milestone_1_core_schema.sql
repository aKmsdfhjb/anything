-- TipTrip — Milestone 1, Phase 1
-- Core relational schema, PostGIS viewport lookup, and Row-Level Security.
-- Apply through Supabase CLI migrations or the SQL Editor after reviewing in your project.

begin;

create extension if not exists postgis with schema extensions;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  traveler_points integer not null default 0 check (traveler_points >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.destinations (
  id uuid primary key default gen_random_uuid(),
  country_code varchar(10),
  country_name text,
  city text,
  region text,
  flag_emoji text,
  -- Optional bounding rectangle in WGS84; west/south/east/north.
  bounds extensions.geometry(Polygon, 4326),
  created_at timestamptz not null default now(),
  constraint destinations_has_name check (
    nullif(trim(coalesce(city, '')), '') is not null
    or nullif(trim(coalesce(country_name, '')), '') is not null
  )
);

create index if not exists idx_destinations_bounds on public.destinations using gist (bounds);
create index if not exists idx_destinations_country_code on public.destinations (country_code);

create table if not exists public.map_pins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  title varchar(255) not null,
  description text,
  category varchar(50) not null default 'general',
  location extensions.geography(Point, 4326) not null,
  country_code varchar(10),
  city varchar(100),
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  status text not null default 'active' check (status in ('active', 'hidden', 'removed')),
  engagement_score integer not null default 0 check (engagement_score >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_map_pins_location on public.map_pins using gist (location);
create index if not exists idx_map_pins_category_status on public.map_pins (category, status);
create index if not exists idx_map_pins_user_id on public.map_pins (user_id);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title varchar(255) not null,
  description text,
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trips_date_order check (start_date is null or end_date is null or end_date >= start_date)
);
create index if not exists idx_trips_user_id on public.trips (user_id);

create table if not exists public.saved_tips (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  map_pin_id uuid not null references public.map_pins(id) on delete cascade,
  note text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (trip_id, map_pin_id)
);
create index if not exists idx_saved_tips_trip_order on public.saved_tips (trip_id, sort_order);
create index if not exists idx_saved_tips_map_pin_id on public.saved_tips (map_pin_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists map_pins_set_updated_at on public.map_pins;
create trigger map_pins_set_updated_at before update on public.map_pins for each row execute function public.set_updated_at();
drop trigger if exists trips_set_updated_at on public.trips;
create trigger trips_set_updated_at before update on public.trips for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, nullif(new.raw_user_meta_data ->> 'display_name', ''), nullif(new.raw_user_meta_data ->> 'avatar_url', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Viewport RPC: coordinates are WGS84 degrees; envelope order is longitude then latitude.
create or replace function public.get_pins_in_viewport(
  min_lat double precision, min_lng double precision,
  max_lat double precision, max_lng double precision
)
returns setof public.map_pins
language sql stable security invoker set search_path = '' as $$
  select p.* from public.map_pins as p
  where min_lat <= max_lat and min_lng <= max_lng
    and p.status = 'active'
    and extensions.st_intersects(
      p.location::extensions.geometry,
      extensions.st_makeenvelope(min_lng, min_lat, max_lng, max_lat, 4326)
    );
$$;

alter table public.profiles enable row level security;
alter table public.destinations enable row level security;
alter table public.map_pins enable row level security;
alter table public.trips enable row level security;
alter table public.saved_tips enable row level security;

create policy "profiles_select_authenticated" on public.profiles for select to authenticated using (true);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "destinations_select_public" on public.destinations for select to anon, authenticated using (true);
create policy "map_pins_select_public_active" on public.map_pins for select to anon, authenticated using ((visibility = 'public' and status = 'active') or auth.uid() = user_id);
create policy "map_pins_insert_own" on public.map_pins for insert to authenticated with check (auth.uid() = user_id);
create policy "map_pins_update_own" on public.map_pins for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "map_pins_delete_own" on public.map_pins for delete to authenticated using (auth.uid() = user_id);
create policy "trips_select_own" on public.trips for select to authenticated using (auth.uid() = user_id);
create policy "trips_insert_own" on public.trips for insert to authenticated with check (auth.uid() = user_id);
create policy "trips_update_own" on public.trips for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "trips_delete_own" on public.trips for delete to authenticated using (auth.uid() = user_id);
create policy "saved_tips_select_trip_owner" on public.saved_tips for select to authenticated using (exists (select 1 from public.trips t where t.id = saved_tips.trip_id and t.user_id = auth.uid()));
create policy "saved_tips_insert_trip_owner" on public.saved_tips for insert to authenticated with check (exists (select 1 from public.trips t where t.id = saved_tips.trip_id and t.user_id = auth.uid()));
create policy "saved_tips_update_trip_owner" on public.saved_tips for update to authenticated using (exists (select 1 from public.trips t where t.id = saved_tips.trip_id and t.user_id = auth.uid())) with check (exists (select 1 from public.trips t where t.id = saved_tips.trip_id and t.user_id = auth.uid()));
create policy "saved_tips_delete_trip_owner" on public.saved_tips for delete to authenticated using (exists (select 1 from public.trips t where t.id = saved_tips.trip_id and t.user_id = auth.uid()));

commit;
