export async function getCurrentUser(supabase) {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user || null;
}

export async function listMyTrips(supabase) {
  const user = await getCurrentUser(supabase);
  if (!user) return { user: null, trips: [] };
  const { data, error } = await supabase
    .from('trips')
    .select('id,title,description,start_date,end_date,created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return { user, trips: data || [] };
}

export async function createTrip(supabase, title) {
  const user = await getCurrentUser(supabase);
  if (!user) throw new Error('Sign in before creating a trip.');
  const cleanTitle = String(title || '').trim();
  if (!cleanTitle) throw new Error('Enter a trip name.');
  const { data, error } = await supabase
    .from('trips')
    .insert({ user_id: user.id, title: cleanTitle })
    .select('id,title,description,start_date,end_date,created_at')
    .single();
  if (error) throw error;
  return data;
}

export async function saveTipToTrip(supabase, tripId, pinId) {
  if (!tripId || !pinId) throw new Error('Choose a trip and a valid tip.');
  const { data, error } = await supabase
    .from('saved_tips')
    .upsert({ trip_id: tripId, map_pin_id: pinId }, { onConflict: 'trip_id,map_pin_id', ignoreDuplicates: true })
    .select('id,trip_id,map_pin_id')
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listSavedTips(supabase, tripId) {
  const { data, error } = await supabase
    .from('saved_tips')
    .select('id,note,sort_order,created_at,map_pins(id,title,description,category,city)')
    .eq('trip_id', tripId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createTip(supabase, { title, description, category, latitude, longitude, city, countryCode }) {
  const user = await getCurrentUser(supabase);
  if (!user) throw new Error('Sign in before adding a tip.');
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!String(title || '').trim()) throw new Error('Enter a tip title.');
  if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
    throw new Error('Search for a destination first so the tip has valid coordinates.');
  }
  const { data, error } = await supabase
    .from('map_pins')
    .insert({
      user_id: user.id,
      title: String(title).trim(),
      description: String(description || '').trim() || null,
      category: category || 'general',
      location: `SRID=4326;POINT(${lng} ${lat})`,
      city: city || null,
      country_code: countryCode || null,
      visibility: 'public',
      status: 'active',
    })
    .select('id,title,description,category,city,visibility,status,engagement_score,created_at,updated_at')
    .single();
  if (error) throw error;
  return { ...data, latitude: lat, longitude: lng };
}
