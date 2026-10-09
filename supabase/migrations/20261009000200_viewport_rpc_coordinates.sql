-- Return explicit WGS84 coordinates so PostgREST clients do not need to
-- parse the internal serialization of the geography column.
begin;

drop function if exists public.get_pins_in_viewport(double precision, double precision, double precision, double precision);

create function public.get_pins_in_viewport(
  min_lat double precision,
  min_lng double precision,
  max_lat double precision,
  max_lng double precision
)
returns table (
  id uuid,
  user_id uuid,
  title varchar(255),
  description text,
  category varchar(50),
  latitude double precision,
  longitude double precision,
  country_code varchar(10),
  city varchar(100),
  visibility text,
  status text,
  engagement_score integer,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    p.id,
    p.user_id,
    p.title,
    p.description,
    p.category,
    extensions.st_y(p.location::extensions.geometry)::double precision as latitude,
    extensions.st_x(p.location::extensions.geometry)::double precision as longitude,
    p.country_code,
    p.city,
    p.visibility,
    p.status,
    p.engagement_score,
    p.created_at,
    p.updated_at
  from public.map_pins as p
  where min_lat <= max_lat
    and min_lng <= max_lng
    and p.status = 'active'
    and extensions.st_intersects(
      p.location::extensions.geometry,
      extensions.st_makeenvelope(min_lng, min_lat, max_lng, max_lat, 4326)
    );
$$;

commit;
