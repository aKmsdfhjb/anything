import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, FlatList, Modal, Pressable, SafeAreaView, ScrollView,
  StatusBar, StyleSheet, Text, TextInput, View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { createClient } from '@supabase/supabase-js';
import TipMarker from './src/components/TipMarker';
import { colors, radii, shadows, spacing, typography, categoryColors } from './src/theme/tiptripTheme';
import { TIP_CATEGORIES } from './src/theme/tipCategories';
import { useMapPinStore } from './src/state/mapPinStore';
import { searchDestinations, destinationRegion } from './src/services/geocoding';
import { createTip, createTrip, listMyTrips, listSavedTips, saveTipToTrip } from './src/services/tripRepository';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

const DEMO_DESTINATIONS = [
  { id: 'hong-kong', title: 'Hong Kong', country: 'Hong Kong', subtitle: 'Towering skyscrapers meet traditional markets', flag: '🇭🇰', count: '2 places', image: '🌆', tips: 0 },
  { id: 'rhodes', title: 'Rhodes', country: 'Greece', subtitle: 'Island villages, turquoise coves and history', flag: '🇬🇷', count: '12 places', image: '🏝️', tips: 12 },
  { id: 'bali', title: 'Bali', country: 'Indonesia', subtitle: 'Temple visits, rice terraces and hidden beaches', flag: '🇮🇩', count: '8 places', image: '🌴', tips: 8 },
];
const DEMO_TIPS = [
  { id: 'demo-1', title: 'Find the best harbor view', description: 'Head uphill just before sunset for a sweeping view over the skyline.', city: 'Hong Kong', category: 'viewpoints', author: 'Mia T.', score: 24, latitude: 22.2805, longitude: 114.1588 },
  { id: 'demo-2', title: 'A quiet cove worth the walk', description: 'A short coastal walk leads to clear water and a peaceful place to pause.', city: 'Rhodes', category: 'nature', author: 'Alex R.', score: 18, latitude: 36.1667, longitude: 27.95 },
  { id: 'demo-3', title: 'Local breakfast stop', description: 'Look for the small family-run places just off the busiest street.', city: 'Hong Kong', category: 'food', author: 'Jamie L.', score: 12, latitude: 22.285, longitude: 114.17 },
];
const INITIAL_REGION = { latitude: 22.2855, longitude: 114.1577, latitudeDelta: 0.13, longitudeDelta: 0.13 };

function BrandHeader({ eyebrow, title, subtitle, right }) {
  return (
    <LinearGradient colors={[colors.tealDark, colors.teal, colors.mint]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
      <View style={styles.heroTop}>
        <View style={styles.brandMark}><Text style={styles.brandMarkText}>✈</Text></View>
        <Text style={styles.brandName}>TipTrip</Text>
        {right ? <View style={{ marginLeft: 'auto' }}>{right}</View> : null}
      </View>
      {eyebrow ? <Text style={styles.heroEyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.heroTitle}>{title}</Text>
      {subtitle ? <Text style={styles.heroSubtitle}>{subtitle}</Text> : null}
    </LinearGradient>
  );
}

function SearchBox({ value, onChangeText, placeholder }) {
  return (
    <View style={styles.searchBox}>
      <Text style={styles.searchIcon}>⌕</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || 'Search places, countries or experiences...'}
        placeholderTextColor={colors.muted}
        style={styles.searchInput}
        returnKeyType="search"
        accessibilityLabel="Search destinations and travel tips"
      />
      {value ? <Pressable onPress={() => onChangeText('')} accessibilityLabel="Clear search"><Text style={styles.clearText}>×</Text></Pressable> : null}
    </View>
  );
}

const DestinationCard = memo(function DestinationCard({ item, onPress }) {
  return (
    <Pressable onPress={() => onPress(item)} style={({ pressed }) => [styles.destinationCard, pressed && styles.pressed]}>
      <LinearGradient colors={item.id === 'rhodes' ? ['#3B82F6', '#7DD3FC'] : item.id === 'bali' ? ['#0D9488', '#B7E4C7'] : ['#4338CA', '#F9A8D4']} style={styles.destinationArt}>
        <Text style={styles.destinationEmoji}>{item.image}</Text>
        <Text style={styles.destinationFlag}>{item.flag}</Text>
      </LinearGradient>
      <View style={styles.destinationBody}>
        <Text style={styles.destinationTitle}>{item.title}</Text>
        <Text style={styles.destinationCountry}>{item.country}</Text>
        <Text numberOfLines={2} style={styles.destinationSubtitle}>{item.subtitle}</Text>
        <View style={styles.cardFooter}><Text style={styles.tipCount}>{item.tips} tips</Text><Text style={styles.cardArrow}>↗</Text></View>
      </View>
    </Pressable>
  );
});

function TipCard({ item, onLove }) {
  const tint = categoryColors[item.category] || colors.teal;
  return (
    <View style={styles.tipCard}>
      <View style={styles.tipTopline}>
        <View style={[styles.avatar, { backgroundColor: tint + '20' }]}><Text style={[styles.avatarText, { color: tint }]}>{(item.author || 'T').slice(0, 1)}</Text></View>
        <View style={{ flex: 1 }}><Text style={styles.author}>{item.author || 'TipTrip traveler'}</Text><Text style={styles.tipLocation}>⌖ {item.city || 'A place to discover'}</Text></View>
        <Text style={styles.moreIcon}>•••</Text>
      </View>
      <View style={[styles.tipArt, { backgroundColor: tint + '16' }]}><Text style={styles.tipArtEmoji}>{({ food: '🥢', hotel: '🛏️', nature: '🌿', viewpoints: '🌇', excursions: '🧭', transportation: '🚌' })[item.category] || '📍'}</Text><View style={[styles.categoryPill, { backgroundColor: tint + '20' }]}><Text style={[styles.categoryPillText, { color: tint }]}>{item.category || 'general'}</Text></View></View>
      <View style={styles.tipBody}>
        <Text style={styles.tipTitle}>{item.title}</Text>
        <Text style={styles.tipDescription}>{item.description}</Text>
        <View style={styles.tipActions}><Text style={styles.engagement}>♡ {item.score || 0}</Text><Text style={styles.engagement}>▢ Save</Text><Pressable style={styles.loveButton} onPress={() => onLove(item)}><Text style={styles.loveButtonText}>♡ Love this</Text></Pressable></View>
      </View>
    </View>
  );
}

function ExploreScreen({ onDestination, onTab, onAddPlace }) {
  const [search, setSearch] = useState('');
  const [remoteResults, setRemoteResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const destinations = DEMO_DESTINATIONS.filter(d => (d.title + d.country + d.subtitle).toLowerCase().includes(search.toLowerCase()));
  useEffect(() => {
    if (search.trim().length < 2 || !process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN) {
      setRemoteResults([]);
      setSearching(false);
      setSearchError('');
      return undefined;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      setSearchError('');
      try {
        const results = await searchDestinations(search, { signal: controller.signal });
        setRemoteResults(results);
      } catch (error) {
        if (error.name !== 'AbortError') setSearchError('Destination search is temporarily unavailable.');
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 350);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [search]);
  const chooseResult = item => onDestination({
    ...item,
    title: item.title || item.placeName,
    country: item.country || '',
    region: destinationRegion(item),
  });
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <BrandHeader eyebrow="PLAN. DISCOVER. SHARE." title="Travel smarter." subtitle="Real travel tips from real people." />
      <View style={styles.contentPad}>
        <SearchBox value={search} onChangeText={setSearch} />
        {searching ? <View style={styles.searchStatus}><ActivityIndicator color={colors.teal} /><Text style={styles.searchStatusText}>Searching destinations…</Text></View> : null}
        {searchError ? <Text style={styles.inlineError}>{searchError}</Text> : null}
        {remoteResults.length ? <View style={styles.geocodeResults}>{remoteResults.map(item => <Pressable key={item.id} onPress={() => chooseResult(item)} style={styles.geocodeResult}><Text style={styles.geocodeResultTitle}>{item.title}</Text><Text style={styles.geocodeResultSubtitle}>{item.placeName}</Text><Text style={styles.geocodeArrow}>↗</Text></Pressable>)}</View> : null}
        {search.trim().length >= 2 && !searching && !remoteResults.length && !destinations.length ? <View style={styles.fallbackCard}><Text style={styles.fallbackTitle}>Don't see your place?</Text><Text style={styles.fallbackBody}>Add the destination and share the first tip for it.</Text><Pressable style={styles.primaryButton} onPress={() => onAddPlace({ title: search.trim() })}><Text style={styles.primaryButtonText}>＋ Add a Place & Tip</Text></Pressable></View> : null}
        <View style={styles.quickChips}><Text style={styles.quickChipActive}>✦ On fire</Text><Text style={styles.quickChip}>↗ Fresh</Text><Text style={styles.quickChip}>★ Top picks</Text></View>
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Popular destinations</Text><Pressable onPress={() => onTab('map')}><Text style={styles.seeAll}>Explore map ›</Text></Pressable></View>
        <FlatList data={destinations} horizontal keyExtractor={x => x.id} showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingBottom: 8 }} renderItem={({ item }) => <DestinationCard item={item} onPress={onDestination} />} />
        <View style={[styles.sectionHeader, { marginTop: 22 }]}><Text style={styles.sectionTitle}>What's hot 🔥</Text><Pressable onPress={() => onTab('feed')}><Text style={styles.seeAll}>See all ›</Text></Pressable></View>
        {DEMO_TIPS.slice(0, 2).map(tip => <TipCard key={tip.id} item={tip} onLove={() => onTab('feed')} />)}
        <View style={styles.ctaCard}><Text style={styles.ctaTitle}>Your next great tip starts here</Text><Text style={styles.ctaText}>Share a place that made your trip special.</Text><Pressable style={styles.primaryButton} onPress={() => onAddPlace({ title: '' })}><Text style={styles.primaryButtonText}>＋ Leave a tip</Text></Pressable></View>
      </View>
    </ScrollView>
  );
}

function FeedScreen() {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const visible = DEMO_TIPS.filter(t => (category === 'all' || t.category === category) && (t.title + t.description + t.city).toLowerCase().includes(search.toLowerCase()));
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <BrandHeader eyebrow="COMMUNITY FEED" title="What's hot 🔥" subtitle="Travel tips from around the world." />
      <View style={styles.contentPad}>
        <SearchBox value={search} onChangeText={setSearch} placeholder="Search travel tips..." />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {[{ id: 'all', label: 'All' }, ...TIP_CATEGORIES].map(c => <Pressable key={c.id} onPress={() => setCategory(c.id)} style={[styles.filterChip, category === c.id && styles.filterChipActive]}><Text style={[styles.filterText, category === c.id && styles.filterTextActive]}>{c.label}</Text></Pressable>)}
        </ScrollView>
        {visible.length ? visible.map(item => <TipCard key={item.id} item={item} onLove={() => {}} />) : <EmptyState title="No tips found yet" body="Try another search or category." />}
      </View>
    </ScrollView>
  );
}

function MapScreen({ pins, loading, error, onRegionChange, onSelectPin, onAddPlace, selectedPin, region, setRegion, cameraCommand }) {
  const mapRef = useRef(null);
  useEffect(() => { if (cameraCommand > 0 && region) mapRef.current?.animateToRegion(region, 550); }, [cameraCommand]);
  const category = useMapPinStore(state => state.activeCategory);
  const setCategory = useMapPinStore(state => state.setActiveCategory);
  const visiblePins = pins.filter(p => category === 'all' || String(p.category || 'general').toLowerCase() === category);
  return (
    <View style={styles.mapScreen}>
      <View style={styles.mapHeader}><Text style={styles.mapKicker}>DISCOVER NEARBY</Text><Text style={styles.mapTitle}>Explore the map</Text><Text style={styles.mapSubtitle}>Find tips shared by real travelers.</Text></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mapFilters}>
        {[{ id: 'all', label: 'All tips' }, ...TIP_CATEGORIES].map(c => <Pressable key={c.id} onPress={() => setCategory(c.id)} style={[styles.filterChip, category === c.id && styles.filterChipActive]}><Text style={[styles.filterText, category === c.id && styles.filterTextActive]}>{c.label}</Text></Pressable>)}
      </ScrollView>
      <View style={styles.mapFrame}>
        <MapView ref={mapRef} style={StyleSheet.absoluteFill} initialRegion={INITIAL_REGION} region={region} onRegionChangeComplete={r => { setRegion(r); onRegionChange(r); }} showsUserLocation={false} showsCompass>
          {visiblePins.map(pin => <TipMarker key={pin.id} pin={pin} selected={selectedPin?.id === pin.id} onPress={onSelectPin} />)}
        </MapView>
        {loading ? <View style={styles.mapStatus}><ActivityIndicator color={colors.teal} /><Text style={styles.mapStatusText}>Finding tips in this area…</Text></View> : null}
        {error ? <View style={styles.mapStatus}><Text style={styles.mapStatusText}>{error}</Text></View> : null}
        {!loading && visiblePins.length === 0 ? <View style={styles.mapEmptyOverlay}><Text style={styles.fallbackTitle}>Don't see your place?</Text><Text style={styles.fallbackBody}>There are no tips in this map view yet. Be the first to add one.</Text><Pressable style={styles.primaryButton} onPress={() => onAddPlace({ title: '', region })}><Text style={styles.primaryButtonText}>＋ Add a Place & Tip</Text></Pressable></View> : null}
        <Pressable style={styles.recenterButton} onPress={() => { setRegion(INITIAL_REGION); mapRef.current?.animateToRegion(INITIAL_REGION, 550); onRegionChange(INITIAL_REGION); }}><Text style={styles.recenterText}>◎</Text></Pressable>
      </View>
      <View style={styles.mapLegend}><Text style={styles.mapLegendTitle}>{visiblePins.length} tips in view</Text><Text style={styles.mapLegendSub}>{supabase ? 'Connected to Supabase' : 'Preview data · add Supabase keys to load live tips'}</Text></View>
    </View>
  );
}

function TripsScreen({ client, trips = [], loading = false }) {
  const [savedByTrip, setSavedByTrip] = useState({});
  useEffect(() => {
    let active = true;
    if (!client || !trips.length) { setSavedByTrip({}); return undefined; }
    Promise.all(trips.map(async trip => {
      try { return [trip.id, await listSavedTips(client, trip.id)]; }
      catch { return [trip.id, []]; }
    })).then(entries => { if (active) setSavedByTrip(Object.fromEntries(entries)); });
    return () => { active = false; };
  }, [client, trips]);
  return <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}><BrandHeader eyebrow="YOUR ADVENTURES" title="My Trips ✈" subtitle="Keep your favorite tips together." /><View style={styles.contentPad}>{loading ? <ActivityIndicator color={colors.teal} /> : trips.length ? trips.map(trip => <View key={trip.id} style={styles.tripCard}><Text style={styles.tripCardTitle}>{trip.title}</Text><Text style={styles.tripCardMeta}>{(savedByTrip[trip.id] || []).length} saved tips</Text>{(savedByTrip[trip.id] || []).map(saved => <View key={saved.id} style={styles.savedTipRow}><Text style={styles.savedTipTitle}>{saved.map_pins?.title || 'Saved travel tip'}</Text>{saved.map_pins?.description ? <Text style={styles.tripCardMeta}>{saved.map_pins.description}</Text> : null}</View>)}</View>) : <View style={styles.emptyTrip}><Text style={styles.emptyTripEmoji}>✈️</Text><Text style={styles.emptyTripTitle}>No trips yet!</Text><Text style={styles.emptyTripBody}>Save a tip to a new trip to start planning your next adventure.</Text></View>}</View></ScrollView>;
}
function ProfileScreen({ client }) {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [createAccount, setCreateAccount] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (!client) return undefined;
    client.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => listener.subscription.unsubscribe();
  }, [client]);
  const authenticate = async () => {
    if (!client) { setMessage('Configure Supabase URL and anon key first.'); return; }
    setBusy(true); setMessage('');
    try {
      const result = createAccount
        ? await client.auth.signUp({ email: email.trim(), password })
        : await client.auth.signInWithPassword({ email: email.trim(), password });
      if (result.error) throw result.error;
      if (createAccount && !result.data.session) setMessage('Account created. Check your email to confirm, then sign in.');
      else setMessage(createAccount ? 'Account created and signed in.' : 'Signed in successfully.');
    } catch (e) { setMessage(e.message || 'Authentication failed.'); }
    finally { setBusy(false); }
  };
  const signOut = async () => {
    if (!client) return;
    const { error } = await client.auth.signOut();
    setMessage(error ? error.message : 'Signed out.');
  };
  return <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}><BrandHeader eyebrow="YOUR TRAVEL PROFILE" title="Your profile" subtitle="Your discoveries, all in one place." /><View style={styles.profileCard}><View style={styles.profileAvatar}><Text style={styles.profileAvatarText}>✈</Text></View><Text style={styles.profileName}>{session?.user?.email || 'Welcome, traveler!'}</Text><Text style={styles.profileDescription}>{session ? 'You are signed in. You can publish tips and save them to private trips.' : 'Sign in or create an account to publish tips and keep your itineraries private.'}</Text>{!session ? <><TextInput style={[styles.formInput, styles.authInput]} value={email} onChangeText={setEmail} placeholder="Email address" keyboardType="email-address" autoCapitalize="none" autoComplete="email" placeholderTextColor={colors.muted} /><TextInput style={[styles.formInput, styles.authInput]} value={password} onChangeText={setPassword} placeholder="Password (at least 6 characters)" secureTextEntry autoComplete={createAccount ? 'new-password' : 'password'} placeholderTextColor={colors.muted} /><Pressable disabled={busy} style={[styles.primaryButton, styles.authButton]} onPress={authenticate}><Text style={styles.primaryButtonText}>{busy ? 'Please wait…' : createAccount ? 'Create account' : 'Sign in'}</Text></Pressable><Pressable onPress={() => { setCreateAccount(!createAccount); setMessage(''); }}><Text style={styles.authSwitch}>{createAccount ? 'Already have an account? Sign in' : 'New to TipTrip? Create an account'}</Text></Pressable></> : <Pressable style={styles.primaryButton} onPress={signOut}><Text style={styles.primaryButtonText}>Sign out</Text></Pressable>}{message ? <Text style={styles.authMessage}>{message}</Text> : null}</View></ScrollView>;
}
function EmptyState({ title, body }) { return <View style={styles.emptyState}><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyBody}>{body}</Text></View>; }

function AddTipModal({ visible, destination, defaultRegion, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!visible) return;
    setTitle('');
    setDescription('');
    setCategory('general');
    setLatitude(destination?.region ? String(destination.region.latitude) : '');
    setLongitude(destination?.region ? String(destination.region.longitude) : '');
    setError('');
  }, [visible, destination]);
  const submit = async () => {
    setBusy(true); setError('');
    try {
      await onSubmit({
        title, description, category,
        latitude: latitude.trim() ? Number(latitude) : NaN,
        longitude: longitude.trim() ? Number(longitude) : NaN,
        city: destination?.title || destination?.placeName || null,
        countryCode: null,
      });
    } catch (e) {
      setError(e.message || 'Could not add this tip.');
    } finally { setBusy(false); }
  };
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeading}><Text style={styles.modalTitle}>Add a Place & Tip</Text><Pressable onPress={onClose}><Text style={styles.modalClose}>×</Text></Pressable></View>
          <Text style={styles.modalHelp}>Share a useful tip with the TipTrip community.</Text>
          {destination?.title ? <Text style={styles.selectedDestinationLabel}>Destination: {destination.title}</Text> : null}
          <TextInput style={styles.formInput} value={title} onChangeText={setTitle} placeholder="Tip title" placeholderTextColor={colors.muted} maxLength={255} />
          <TextInput style={[styles.formInput, styles.formTextarea]} value={description} onChangeText={setDescription} placeholder="What should travelers know?" placeholderTextColor={colors.muted} multiline />
          <Text style={styles.formLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {TIP_CATEGORIES.map(item => <Pressable key={item.id} onPress={() => setCategory(item.id)} style={[styles.filterChip, category === item.id && styles.filterChipActive]}><Text style={[styles.filterText, category === item.id && styles.filterTextActive]}>{item.label}</Text></Pressable>)}
          </ScrollView>
          <Text style={styles.formLabel}>Coordinates (required)</Text>
          <View style={styles.coordinateRow}><TextInput style={[styles.formInput, styles.coordinateInput]} value={latitude} onChangeText={setLatitude} placeholder="Latitude" keyboardType="decimal-pad" placeholderTextColor={colors.muted} /><TextInput style={[styles.formInput, styles.coordinateInput]} value={longitude} onChangeText={setLongitude} placeholder="Longitude" keyboardType="decimal-pad" placeholderTextColor={colors.muted} /></View>
          {error ? <Text style={styles.inlineError}>{error}</Text> : null}
          <Pressable disabled={busy} style={[styles.primaryButton, busy && styles.disabledButton]} onPress={submit}><Text style={styles.primaryButtonText}>{busy ? 'Publishing…' : 'Publish tip'}</Text></Pressable>
          <Text style={styles.modalFootnote}>You must be signed in. Add only places and coordinates you can reasonably verify.</Text>
        </View>
      </View>
    </Modal>
  );
}

function SaveTripModal({ visible, pin, onClose, onSave }) {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState('');
  const [newTripTitle, setNewTripTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    if (visible && supabase) {
      listMyTrips(supabase).then(result => {
        if (active) { setTrips(result.trips); setSelectedTrip(result.trips[0]?.id || ''); }
      }).catch(e => { if (active) setError(e.message || 'Could not load trips.'); });
    } else if (visible) {
      setError('Connect Supabase and sign in to save tips to a trip.');
    }
    return () => { active = false; };
  }, [visible]);
  const save = async () => {
    setBusy(true); setError('');
    try {
      let tripId = selectedTrip;
      if (!tripId && newTripTitle.trim()) {
        const created = await createTrip(supabase, newTripTitle);
        tripId = created.id;
      }
      if (!tripId) throw new Error('Choose a trip or enter a name for a new one.');
      await onSave(tripId, pin);
      onClose();
    } catch (e) { setError(e.message || 'Could not save this tip.'); }
    finally { setBusy(false); }
  };
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}><View style={styles.modalCard}>
        <View style={styles.modalHeading}><Text style={styles.modalTitle}>Save tip to trip</Text><Pressable onPress={onClose}><Text style={styles.modalClose}>×</Text></Pressable></View>
        <Text style={styles.modalHelp} numberOfLines={2}>{pin?.title || 'Choose a trip for this tip.'}</Text>
        {trips.map(trip => <Pressable key={trip.id} onPress={() => { setSelectedTrip(trip.id); setNewTripTitle(''); }} style={[styles.tripChoice, selectedTrip === trip.id && styles.tripChoiceActive]}><Text style={[styles.tripChoiceText, selectedTrip === trip.id && styles.tripChoiceTextActive]}>{selectedTrip === trip.id ? '● ' : '○ '}{trip.title}</Text></Pressable>)}
        <Text style={styles.formLabel}>{trips.length ? 'Or create a new trip' : 'Create your first trip'}</Text>
        <TextInput style={styles.formInput} value={newTripTitle} onChangeText={value => { setNewTripTitle(value); if (value) setSelectedTrip(''); }} placeholder="e.g. Summer in Greece" placeholderTextColor={colors.muted} />
        {error ? <Text style={styles.inlineError}>{error}</Text> : null}
        <Pressable disabled={busy || !supabase} style={[styles.primaryButton, (busy || !supabase) && styles.disabledButton]} onPress={save}><Text style={styles.primaryButtonText}>{busy ? 'Saving…' : 'Save to trip'}</Text></Pressable>
      </View></View>
    </Modal>
  );
}

export default function App() {
  const [tab, setTab] = useState('explore');
  const pins = useMapPinStore(state => state.pins);
  const setPins = useMapPinStore(state => state.setPins);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [region, setRegion] = useState(INITIAL_REGION);
  const [cameraCommand, setCameraCommand] = useState(0);
  const [selectedPin, setSelectedPin] = useState(null);
  const [addTipDestination, setAddTipDestination] = useState(null);
  const [addTipVisible, setAddTipVisible] = useState(false);
  const [saveTripVisible, setSaveTripVisible] = useState(false);
  const [myTrips, setMyTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const requestSequence = useRef(0);
  const debounceTimer = useRef(null);

  const loadViewport = useCallback(async nextRegion => {
    const requestId = ++requestSequence.current;
    if (!supabase) { setPins(DEMO_TIPS, 'demo'); setError(''); return; }
    setLoading(true); setError('');
    const latPad = nextRegion.latitudeDelta / 2;
    const lngPad = nextRegion.longitudeDelta / 2;
    try {
      const { data, error: rpcError } = await supabase.rpc('get_pins_in_viewport', {
        min_lat: Math.max(-90, nextRegion.latitude - latPad),
        min_lng: Math.max(-180, nextRegion.longitude - lngPad),
        max_lat: Math.min(90, nextRegion.latitude + latPad),
        max_lng: Math.min(180, nextRegion.longitude + lngPad),
      });
      if (rpcError) throw rpcError;
      const livePins = (data || []).map(row => {
        const point = row.location?.coordinates;
        return { ...row, latitude: row.latitude ?? point?.[1], longitude: row.longitude ?? point?.[0] };
      }).filter(p => Number.isFinite(Number(p.latitude)) && Number.isFinite(Number(p.longitude)));
      if (requestId === requestSequence.current) setPins(livePins, [nextRegion.latitude, nextRegion.longitude, nextRegion.latitudeDelta, nextRegion.longitudeDelta].join(':'));
    } catch (e) {
      if (requestId === requestSequence.current) { setError('Could not load live pins. Check Supabase setup and RLS.'); setPins([], null); }
    } finally { if (requestId === requestSequence.current) setLoading(false); }
  }, []);

  const scheduleViewportLoad = useCallback(nextRegion => {
    // The map component calls this on settled regions; use a short debounce to avoid
    // issuing a database request for every intermediate gesture frame.
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => loadViewport(nextRegion), 300);
  }, [loadViewport]);

  useEffect(() => { if (tab === 'map') scheduleViewportLoad(region); }, [tab, region, scheduleViewportLoad]);
  useEffect(() => {
    let active = true;
    if (tab === 'trips' && supabase) {
      setTripsLoading(true);
      listMyTrips(supabase).then(result => { if (active) setMyTrips(result.trips); }).catch(e => { if (active) setNotice(e.message || 'Could not load trips.'); }).finally(() => { if (active) setTripsLoading(false); });
    }
    return () => { active = false; };
  }, [tab]);
  useEffect(() => () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); requestSequence.current += 1; }, []);

  const openAddTip = useCallback(destination => {
    setAddTipDestination(destination || null);
    setAddTipVisible(true);
  }, []);

  const chooseDestination = useCallback(item => {
    setTab('map');
    const resolved = destinationRegion(item);
    const target = resolved || (item.id === 'rhodes' ? { ...INITIAL_REGION, latitude: 36.1667, longitude: 27.95 } : item.id === 'bali' ? { ...INITIAL_REGION, latitude: -8.4095, longitude: 115.1889 } : INITIAL_REGION);
    setRegion(target);
    setCameraCommand(value => value + 1);
  }, []);

  const submitNewTip = useCallback(async payload => {
    if (!supabase) throw new Error('Configure Supabase URL and anon key before publishing tips.');
    const created = await createTip(supabase, payload);
    setPins([...useMapPinStore.getState().pins, created], 'new-tip');
    setAddTipVisible(false);
    setTab('map');
    setRegion({ latitude: created.latitude, longitude: created.longitude, latitudeDelta: 0.08, longitudeDelta: 0.08 });
    setNotice('Your tip was published.');
  }, [setPins]);

  const submitSaveTip = useCallback(async (tripId, pin) => {
    if (!supabase) throw new Error('Configure Supabase before saving tips.');
    if (!pin?.id || String(pin.id).startsWith('demo-')) throw new Error('Demo tips cannot be saved. Select a real tip loaded from Supabase.');
    await saveTipToTrip(supabase, tripId, pin.id);
    const result = await listMyTrips(supabase);
    setMyTrips(result.trips);
    setNotice('Tip saved to your trip.');
  }, []);

  const nav = [
    { id: 'explore', label: 'Explore', glyph: '◉' },
    { id: 'feed', label: 'Feed', glyph: '✧' },
    { id: 'trips', label: 'Trips', glyph: '✈' },
    { id: 'map', label: 'Map', glyph: '⌖' },
    { id: 'profile', label: 'Profile', glyph: '♙' },
  ];

  return (
    <SafeAreaView style={styles.app}>
      <StatusBar barStyle="light-content" backgroundColor={colors.tealDark} />
      <View style={styles.main}>
        {tab === 'explore' ? <ExploreScreen onDestination={chooseDestination} onTab={setTab} onAddPlace={openAddTip} /> : null}
        {tab === 'feed' ? <FeedScreen /> : null}
        {tab === 'map' ? <MapScreen pins={pins} loading={loading} error={error} onRegionChange={scheduleViewportLoad} onSelectPin={setSelectedPin} onAddPlace={openAddTip} selectedPin={selectedPin} region={region} setRegion={setRegion} cameraCommand={cameraCommand} /> : null}
        {tab === 'trips' ? <TripsScreen client={supabase} trips={myTrips} loading={tripsLoading} /> : null}
        {tab === 'profile' ? <ProfileScreen client={supabase} /> : null}
      </View>
      {selectedPin ? <View style={styles.selectedPanel}><Pressable onPress={() => setSelectedPin(null)} style={styles.closeSelected}><Text style={styles.closeSelectedText}>×</Text></Pressable><Text style={styles.selectedTitle}>{selectedPin.title}</Text><Text style={styles.selectedDescription}>{selectedPin.description || selectedPin.city || 'Travel tip'}</Text><Pressable style={[styles.primaryButton, styles.saveTipButton]} onPress={() => setSaveTripVisible(true)}><Text style={styles.primaryButtonText}>＋ Save to trip</Text></Pressable></View> : null}
      {notice ? <Pressable style={styles.noticeToast} onPress={() => setNotice('')}><Text style={styles.noticeText}>{notice}  ×</Text></Pressable> : null}
      <AddTipModal visible={addTipVisible} destination={addTipDestination} defaultRegion={region} onClose={() => setAddTipVisible(false)} onSubmit={submitNewTip} />
      <SaveTripModal visible={saveTripVisible} pin={selectedPin} onClose={() => setSaveTripVisible(false)} onSave={submitSaveTip} />
      <View style={styles.bottomNav}>
        {nav.map(item => <Pressable key={item.id} onPress={() => { setSelectedPin(null); setTab(item.id); }} style={styles.navItem} accessibilityRole="button" accessibilityState={{ selected: tab === item.id }}><Text style={[styles.navGlyph, tab === item.id && styles.navGlyphActive]}>{item.glyph}</Text><Text style={[styles.navLabel, tab === item.id && styles.navLabelActive]}>{item.label}</Text></Pressable>)}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: colors.canvas },
  main: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.canvas },
  screenContent: { paddingBottom: 24 },
  hero: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 30, borderBottomLeftRadius: 26, borderBottomRightRadius: 26 },
  heroTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  brandMark: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#FFFFFFCC', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  brandMarkText: { color: colors.tealDark, fontSize: 20, fontWeight: '900' },
  brandName: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', letterSpacing: -0.8 },
  heroEyebrow: { color: '#E9FFFB', fontSize: 10, letterSpacing: 2, fontWeight: '800', marginBottom: 8 },
  heroTitle: { color: '#FFFFFF', fontSize: 31, lineHeight: 37, fontWeight: '900', letterSpacing: -0.8 },
  heroSubtitle: { color: '#E9FFFB', fontSize: 14, marginTop: 5, lineHeight: 20 },
  contentPad: { paddingHorizontal: 18, paddingTop: 18 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.pill, paddingHorizontal: 15, height: 52, ...shadows.card, marginBottom: 14 },
  searchIcon: { fontSize: 28, color: colors.muted, marginRight: 9, marginTop: -4 },
  searchInput: { flex: 1, fontSize: 14, color: colors.text, paddingVertical: 0 },
  clearText: { color: colors.muted, fontSize: 24, paddingLeft: 8 },
  quickChips: { flexDirection: 'row', gap: 8, marginBottom: 23 },
  quickChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radii.pill, backgroundColor: '#E6F4F1', color: colors.tealDark, fontSize: 12, overflow: 'hidden', fontWeight: '700' },
  quickChipActive: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radii.pill, backgroundColor: colors.tealDark, color: '#FFFFFF', fontSize: 12, overflow: 'hidden', fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { ...typography.sectionTitle, color: colors.ink },
  seeAll: { color: colors.tealDark, fontWeight: '700', fontSize: 12 },
  destinationCard: { width: 218, backgroundColor: colors.surface, borderRadius: radii.lg, overflow: 'hidden', ...shadows.card },
  destinationArt: { height: 116, alignItems: 'center', justifyContent: 'center' },
  destinationEmoji: { fontSize: 53 },
  destinationFlag: { position: 'absolute', right: 12, top: 10, fontSize: 24 },
  destinationBody: { padding: 14 },
  destinationTitle: { fontSize: 18, fontWeight: '800', color: colors.ink },
  destinationCountry: { fontSize: 11, color: colors.tealDark, fontWeight: '700', marginTop: 2 },
  destinationSubtitle: { fontSize: 12, color: colors.muted, lineHeight: 17, marginTop: 8, minHeight: 34 },
  cardFooter: { marginTop: 11, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', justifyContent: 'space-between' },
  tipCount: { color: colors.muted, fontSize: 12 },
  cardArrow: { color: colors.teal, fontWeight: '800' },
  tipCard: { backgroundColor: colors.surface, borderRadius: radii.lg, marginBottom: 16, overflow: 'hidden', ...shadows.card },
  tipTopline: { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 15, fontWeight: '900' },
  author: { fontSize: 13, fontWeight: '800', color: colors.text },
  tipLocation: { fontSize: 11, color: colors.muted, marginTop: 3 },
  moreIcon: { color: colors.muted, letterSpacing: 2 },
  tipArt: { height: 118, alignItems: 'center', justifyContent: 'center' },
  tipArtEmoji: { fontSize: 48 },
  categoryPill: { position: 'absolute', left: 12, bottom: 10, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 5 },
  categoryPillText: { fontSize: 10, fontWeight: '800', textTransform: 'capitalize' },
  tipBody: { padding: 15 },
  tipTitle: { fontSize: 17, lineHeight: 22, fontWeight: '800', color: colors.ink },
  tipDescription: { fontSize: 13, lineHeight: 19, color: colors.muted, marginTop: 6 },
  tipActions: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 14 },
  engagement: { fontSize: 12, color: colors.muted, fontWeight: '700' },
  loveButton: { marginLeft: 'auto', borderRadius: radii.pill, backgroundColor: colors.tealDark, paddingHorizontal: 13, paddingVertical: 9 },
  loveButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  ctaCard: { padding: 18, borderRadius: radii.lg, backgroundColor: '#E1F6F1', marginTop: 4 },
  ctaTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  ctaText: { color: colors.muted, fontSize: 13, marginTop: 6, marginBottom: 14 },
  primaryButton: { backgroundColor: colors.tealDark, borderRadius: radii.pill, paddingVertical: 12, paddingHorizontal: 18, alignSelf: 'flex-start' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  filterRow: { flexDirection: 'row', gap: 8, paddingBottom: 15 },
  filterChip: { borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 9, backgroundColor: colors.surface },
  filterChipActive: { backgroundColor: colors.tealDark, borderColor: colors.tealDark },
  filterText: { fontSize: 12, color: colors.text, fontWeight: '700' },
  filterTextActive: { color: '#FFFFFF' },
  emptyState: { padding: 30, alignItems: 'center' },
  emptyTitle: { fontSize: 17, color: colors.ink, fontWeight: '800' },
  emptyBody: { fontSize: 13, color: colors.muted, textAlign: 'center', marginTop: 8 },
  mapScreen: { flex: 1, backgroundColor: colors.canvas },
  mapHeader: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  mapKicker: { color: colors.tealDark, fontSize: 10, letterSpacing: 1.8, fontWeight: '900' },
  mapTitle: { fontSize: 27, fontWeight: '900', color: colors.ink, marginTop: 6 },
  mapSubtitle: { fontSize: 13, color: colors.muted, marginTop: 4 },
  mapFilters: { gap: 8, paddingHorizontal: 18, paddingBottom: 12 },
  mapFrame: { flex: 1, minHeight: 280, marginHorizontal: 12, borderRadius: radii.lg, overflow: 'hidden', backgroundColor: '#D9E9E8' },
  mapStatus: { position: 'absolute', top: 12, left: 12, right: 12, padding: 10, borderRadius: 12, backgroundColor: '#FFFFFFEE', flexDirection: 'row', alignItems: 'center', gap: 8 },
  mapStatusText: { color: colors.text, fontSize: 12, flexShrink: 1 },
  recenterButton: { position: 'absolute', right: 12, bottom: 12, width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', ...shadows.card },
  recenterText: { fontSize: 26, color: colors.tealDark },
  searchStatus: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  searchStatusText: { color: colors.muted, fontSize: 12 },
  geocodeResults: { backgroundColor: colors.surface, borderRadius: radii.md, marginBottom: 12, overflow: 'hidden', ...shadows.card },
  geocodeResult: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  geocodeResultTitle: { fontSize: 14, color: colors.ink, fontWeight: '800', paddingRight: 28 },
  geocodeResultSubtitle: { fontSize: 11, color: colors.muted, marginTop: 3, paddingRight: 28 },
  geocodeArrow: { position: 'absolute', right: 14, top: 15, color: colors.tealDark, fontSize: 18 },
  fallbackCard: { padding: 16, borderRadius: radii.lg, backgroundColor: '#E1F6F1', marginBottom: 16 },
  fallbackTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  fallbackBody: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5, marginBottom: 12 },
  inlineError: { color: '#B42318', fontSize: 12, lineHeight: 18, marginVertical: 8 },
  mapEmptyOverlay: { position: 'absolute', left: 16, right: 16, top: 20, padding: 16, borderRadius: radii.lg, backgroundColor: colors.surface, ...shadows.card },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#102A2A88' },
  modalCard: { backgroundColor: colors.canvas, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 28, maxHeight: '90%' },
  modalHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { fontSize: 21, color: colors.ink, fontWeight: '900' },
  modalClose: { fontSize: 28, color: colors.muted, paddingHorizontal: 6 },
  modalHelp: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 5, marginBottom: 14 },
  selectedDestinationLabel: { color: colors.tealDark, fontWeight: '800', fontSize: 12, marginBottom: 10 },
  formInput: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 12, fontSize: 14, color: colors.text, marginBottom: 10 },
  formTextarea: { minHeight: 76, textAlignVertical: 'top' },
  formLabel: { color: colors.ink, fontSize: 12, fontWeight: '800', marginTop: 4, marginBottom: 8 },
  coordinateRow: { flexDirection: 'row', gap: 10 },
  coordinateInput: { flex: 1, minWidth: 0 },
  modalFootnote: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 12 },
  disabledButton: { opacity: 0.5 },
  tripChoice: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 12, borderRadius: 12, marginBottom: 8 },
  tripChoiceActive: { backgroundColor: '#DDF5EE', borderColor: colors.teal },
  tripChoiceText: { color: colors.text, fontSize: 13, fontWeight: '700' },
  tripChoiceTextActive: { color: colors.tealDark },
  tripCard: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: 16, marginBottom: 12, ...shadows.card },
  tripCardTitle: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  tripCardMeta: { color: colors.muted, fontSize: 12, marginTop: 6, lineHeight: 18 },
  savedTipRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, marginTop: 10 },
  savedTipTitle: { color: colors.text, fontSize: 13, fontWeight: '800' },
  saveTipButton: { alignSelf: 'flex-start', marginTop: 12 },
  authInput: { width: '100%', marginTop: 12, marginBottom: 0 },
  authButton: { marginTop: 14 },
  authSwitch: { color: colors.tealDark, fontSize: 12, fontWeight: '800', marginTop: 16 },
  authMessage: { color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: 12 },
  noticeToast: { position: 'absolute', top: 48, left: 18, right: 18, padding: 13, borderRadius: 12, backgroundColor: colors.tealDark, zIndex: 20 },
  noticeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  mapLegend: { paddingHorizontal: 20, paddingVertical: 12 },
  mapLegendTitle: { color: colors.ink, fontWeight: '800', fontSize: 14 },
  mapLegendSub: { color: colors.muted, fontSize: 11, marginTop: 3 },
  emptyTrip: { flex: 1, padding: 34, alignItems: 'center', justifyContent: 'center' },
  emptyTripEmoji: { fontSize: 56 },
  emptyTripTitle: { fontSize: 22, fontWeight: '900', color: colors.ink, marginTop: 16 },
  emptyTripBody: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 21, marginTop: 8 },
  profileCard: { margin: 20, padding: 22, backgroundColor: colors.surface, borderRadius: radii.lg, alignItems: 'center', ...shadows.card },
  profileAvatar: { width: 74, height: 74, borderRadius: 37, backgroundColor: '#D9F5EE', alignItems: 'center', justifyContent: 'center' },
  profileAvatarText: { fontSize: 31, color: colors.tealDark },
  profileName: { fontSize: 20, color: colors.ink, fontWeight: '900', marginTop: 12 },
  profileDescription: { color: colors.muted, textAlign: 'center', fontSize: 13, lineHeight: 20, marginTop: 7 },
  bottomNav: { flexDirection: 'row', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8, paddingBottom: 5, justifyContent: 'space-around' },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 3, gap: 3 },
  navGlyph: { fontSize: 23, color: '#9AA5B4' },
  navGlyphActive: { color: colors.teal, fontWeight: '900' },
  navLabel: { fontSize: 10, color: colors.muted, fontWeight: '600' },
  navLabelActive: { color: colors.tealDark, fontWeight: '900' },
  selectedPanel: { position: 'absolute', bottom: 70, left: 16, right: 16, backgroundColor: colors.surface, borderRadius: radii.lg, padding: 16, ...shadows.card },
  closeSelected: { position: 'absolute', top: 8, right: 12, zIndex: 2 },
  closeSelectedText: { fontSize: 23, color: colors.muted },
  selectedTitle: { fontSize: 17, color: colors.ink, fontWeight: '800', paddingRight: 22 },
  selectedDescription: { fontSize: 13, color: colors.muted, marginTop: 6, lineHeight: 19 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
});
