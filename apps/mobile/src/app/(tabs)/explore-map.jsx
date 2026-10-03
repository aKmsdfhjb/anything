import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Modal,
} from "react-native";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Image } from "expo-image";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import {
  Search,
  X,
  MapPin,
  Plus,
  Locate,
  Camera,
  ShieldCheck,
  Send,
  CheckCircle,
} from "lucide-react-native";
import useUser from "@/utils/auth/useUser";
import { useAuth } from "@/utils/auth/useAuth";
import useUpload from "@/utils/useUpload";

const { width: SW } = Dimensions.get("window");

// ─── Category config ───────────────────────────────────────────────────────────
const CATEGORIES = [
  { key: "all", label: "All", emoji: "🌍", color: "#008C8F" },
  { key: "food", label: "Food", emoji: "🍴", color: "#F97316" },
  { key: "hotel", label: "Hotels", emoji: "🏨", color: "#3B82F6" },
  { key: "beach", label: "Beaches", emoji: "🏖️", color: "#06B6D4" },
  { key: "attraction", label: "Sights", emoji: "📸", color: "#8B5CF6" },
  { key: "nightlife", label: "Nightlife", emoji: "🎉", color: "#EC4899" },
  { key: "shopping", label: "Shopping", emoji: "🛍️", color: "#F59E0B" },
  { key: "transport", label: "Transport", emoji: "🚕", color: "#64748B" },
  { key: "gem", label: "Hidden Gems", emoji: "💎", color: "#7C3AED" },
];

const TIP_CATS = [
  { key: "recommend", label: "Recommend", emoji: "👍", color: "#10B981" },
  { key: "avoid", label: "Avoid", emoji: "👎", color: "#EF4444" },
  { key: "safety_warning", label: "Warning", emoji: "⚠️", color: "#F59E0B" },
];

const getCat = (k) => CATEGORIES.find((c) => c.key === k) || CATEGORIES[0];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function fmtRelative(ts) {
  if (!ts) return "";
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(diff / 86400000);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtDateLabel(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diff === 0) return "TODAY";
  if (diff === 1) return "YESTERDAY";
  if (diff < 7) return `${diff} DAYS AGO`;
  return d
    .toLocaleDateString("en-GB", { month: "long", year: "numeric" })
    .toUpperCase();
}

// ─── Client-side clustering ────────────────────────────────────────────────────
function computeClusters(pins, region) {
  if (!pins || pins.length === 0) return [];
  const radius = Math.max(region.latitudeDelta * 0.06, 0.002);
  const used = new Set();
  const clusters = [];

  pins.forEach((pin, i) => {
    if (used.has(i)) return;
    const cluster = { key: `c${i}`, pins: [pin] };
    used.add(i);
    pins.forEach((other, j) => {
      if (i === j || used.has(j)) return;
      const dist = Math.sqrt(
        Math.pow(parseFloat(pin.latitude) - parseFloat(other.latitude), 2) +
          Math.pow(parseFloat(pin.longitude) - parseFloat(other.longitude), 2),
      );
      if (dist < radius) {
        cluster.pins.push(other);
        used.add(j);
      }
    });
    cluster.lat =
      cluster.pins.reduce((s, p) => s + parseFloat(p.latitude), 0) /
      cluster.pins.length;
    cluster.lng =
      cluster.pins.reduce((s, p) => s + parseFloat(p.longitude), 0) /
      cluster.pins.length;
    clusters.push(cluster);
  });
  return clusters;
}

// ─── Pin Marker ────────────────────────────────────────────────────────────────
function PinMarker({ pin, onPress }) {
  const cat = getCat(pin.category);
  const count = parseInt(pin.tip_count) || 0;
  return (
    <Marker
      coordinate={{
        latitude: parseFloat(pin.latitude),
        longitude: parseFloat(pin.longitude),
      }}
      onPress={onPress}
      tracksViewChanges={false}
    >
      <View style={{ alignItems: "center" }}>
        <View
          style={{
            backgroundColor: cat.color,
            borderRadius: 18,
            paddingHorizontal: count > 0 ? 10 : 8,
            paddingVertical: 6,
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.25,
            shadowRadius: 5,
            elevation: 6,
            borderWidth: 2,
            borderColor: "#fff",
          }}
        >
          <Text style={{ fontSize: 14 }}>{cat.emoji}</Text>
          {count > 0 && (
            <Text style={{ color: "#fff", fontSize: 11, fontWeight: "900" }}>
              {count}
            </Text>
          )}
        </View>
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 6,
            borderRightWidth: 6,
            borderTopWidth: 8,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderTopColor: cat.color,
            marginTop: -1,
          }}
        />
      </View>
    </Marker>
  );
}

// ─── Cluster Marker ────────────────────────────────────────────────────────────
function ClusterMarker({ cluster, onPress }) {
  const total = cluster.pins.reduce(
    (s, p) => s + (parseInt(p.tip_count) || 1),
    0,
  );
  const sz = total > 50 ? 54 : total > 20 ? 48 : 40;
  return (
    <Marker
      coordinate={{ latitude: cluster.lat, longitude: cluster.lng }}
      onPress={onPress}
      tracksViewChanges={false}
    >
      <View
        style={{
          width: sz,
          height: sz,
          borderRadius: sz / 2,
          backgroundColor: "#008C8F",
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 3,
          borderColor: "#fff",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
          elevation: 8,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontWeight: "900",
            fontSize: total > 99 ? 11 : 14,
          }}
        >
          {total > 99 ? "99+" : total}
        </Text>
      </View>
    </Marker>
  );
}

// ─── Tip Card ──────────────────────────────────────────────────────────────────
function TipCard({ tip }) {
  const cat = TIP_CATS.find((c) => c.key === tip.category) || TIP_CATS[0];
  const photos = (() => {
    try {
      return tip.photo_urls
        ? JSON.parse(tip.photo_urls)
        : tip.photo_url
          ? [tip.photo_url]
          : [];
    } catch {
      return tip.photo_url ? [tip.photo_url] : [];
    }
  })();

  return (
    <View
      style={{
        backgroundColor: "#F8FAFC",
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
        borderLeftWidth: 3,
        borderLeftColor: cat.color,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 8,
          gap: 8,
        }}
      >
        {tip.profile_image ? (
          <Image
            source={{ uri: tip.profile_image }}
            style={{ width: 32, height: 32, borderRadius: 16 }}
          />
        ) : (
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "#E2E8F0",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 14 }}>👤</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Text style={{ color: "#0F172A", fontWeight: "800", fontSize: 13 }}>
              {tip.username || "Traveller"}
            </Text>
            {tip.is_verified && <ShieldCheck size={12} color="#008C8F" />}
          </View>
          <Text style={{ color: "#94A3B8", fontSize: 11 }}>
            {fmtRelative(tip.created_at)}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: cat.color + "20",
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: cat.color, fontSize: 11, fontWeight: "700" }}>
            {cat.emoji} {cat.label}
          </Text>
        </View>
      </View>

      <Text style={{ color: "#334155", fontSize: 14, lineHeight: 21 }}>
        {tip.content}
      </Text>

      {photos.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 10, flexGrow: 0 }}
        >
          {photos.map((url, i) => (
            <Image
              key={i}
              source={{ uri: url }}
              style={{
                width: 100,
                height: 70,
                borderRadius: 10,
                marginRight: 8,
              }}
              contentFit="cover"
            />
          ))}
        </ScrollView>
      )}

      {(tip.upvotes > 0 || tip.comment_count > 0) && (
        <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
          {tip.upvotes > 0 && (
            <Text style={{ color: "#94A3B8", fontSize: 12 }}>
              👍 {tip.upvotes}
            </Text>
          )}
          {tip.comment_count > 0 && (
            <Text style={{ color: "#94A3B8", fontSize: 12 }}>
              💬 {tip.comment_count}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function ExploreMapScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const locationSheetRef = useRef(null);
  const { data: user } = useUser();
  const { signIn } = useAuth();
  const [uploadFile] = useUpload();

  // Map state
  const [mapRegion, setMapRegion] = useState({
    latitude: 43.0,
    longitude: 14.0,
    latitudeDelta: 40,
    longitudeDelta: 40,
  });

  // Pins
  const [pins, setPins] = useState([]);
  const [pinsLoading, setPinsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  // Selection
  const [selectedPin, setSelectedPin] = useState(null);
  const [locationTips, setLocationTips] = useState([]);
  const [tipsLoading, setTipsLoading] = useState(false);

  // Dropped pin (long press)
  const [droppedPin, setDroppedPin] = useState(null);
  const [droppedPinName, setDroppedPinName] = useState("");
  const [droppedPinAddress, setDroppedPinAddress] = useState("");
  const [reverseLoading, setReverseLoading] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeout = useRef(null);

  // Add tip form
  const [showAddTip, setShowAddTip] = useState(false);
  const [addTipLocation, setAddTipLocation] = useState(null);
  const [tipContent, setTipContent] = useState("");
  const [tipCategory, setTipCategory] = useState("recommend");
  const [tipPhotoUrl, setTipPhotoUrl] = useState(null);
  const [tipUploading, setTipUploading] = useState(false);
  const [tipSubmitting, setTipSubmitting] = useState(false);
  const [tipSuccess, setTipSuccess] = useState(false);

  const clusters = useMemo(
    () => computeClusters(pins, mapRegion),
    [pins, mapRegion],
  );
  const locationSheetSnaps = useMemo(() => ["35%", "70%", "95%"], []);

  // ── Load pins ────────────────────────────────────────────────────────────────
  const loadPins = useCallback(async (cat = "all") => {
    try {
      setPinsLoading(true);
      const params = cat !== "all" ? `?category=${cat}` : "";
      const res = await fetch(`/api/map-pins${params}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setPins([...(data.pins || []), ...(data.legacy_pins || [])]);
    } catch (err) {
      console.error("loadPins:", err);
    } finally {
      setPinsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPins(activeCategory);
  }, [activeCategory]);

  // ── Load location tips ───────────────────────────────────────────────────────
  const loadLocationTips = useCallback(async (pin) => {
    if (!pin || pin.is_legacy) {
      setLocationTips([]);
      return;
    }
    setTipsLoading(true);
    try {
      const res = await fetch(`/api/map-tips?location_id=${pin.id}`);
      if (res.ok) {
        const data = await res.json();
        setLocationTips(data.tips || []);
      }
    } catch (err) {
      console.error("loadLocationTips:", err);
    } finally {
      setTipsLoading(false);
    }
  }, []);

  // ── Select a pin ─────────────────────────────────────────────────────────────
  const handlePinPress = useCallback(
    (pin) => {
      setSelectedPin(pin);
      loadLocationTips(pin);
      locationSheetRef.current?.snapToIndex(1);
      mapRef.current?.animateToRegion(
        {
          latitude: parseFloat(pin.latitude) - mapRegion.latitudeDelta * 0.1,
          longitude: parseFloat(pin.longitude),
          latitudeDelta: Math.min(mapRegion.latitudeDelta, 0.05),
          longitudeDelta: Math.min(mapRegion.longitudeDelta, 0.05),
        },
        400,
      );
    },
    [mapRegion, loadLocationTips],
  );

  // ── Cluster press ────────────────────────────────────────────────────────────
  const handleClusterPress = useCallback(
    (cluster) => {
      mapRef.current?.animateToRegion(
        {
          latitude: cluster.lat,
          longitude: cluster.lng,
          latitudeDelta: mapRegion.latitudeDelta * 0.4,
          longitudeDelta: mapRegion.longitudeDelta * 0.4,
        },
        400,
      );
    },
    [mapRegion],
  );

  // ── Long press → drop pin ────────────────────────────────────────────────────
  const handleLongPress = useCallback(async (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setDroppedPin({ latitude, longitude });
    setDroppedPinName("");
    setDroppedPinAddress("");
    setReverseLoading(true);
    locationSheetRef.current?.close();
    try {
      const res = await fetch("/api/places-search", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude, longitude }),
      });
      if (res.ok) {
        const data = await res.json();
        setDroppedPinAddress(data.address || "");
        setDroppedPinName(data.address?.split(",")[0] || "Dropped Pin");
      }
    } catch {
      setDroppedPinName("Dropped Pin");
    } finally {
      setReverseLoading(false);
    }
  }, []);

  // ── Search ────────────────────────────────────────────────────────────────────
  const handleSearchChange = useCallback((text) => {
    setSearchQuery(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (text.length < 2) {
      setSearchResults([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const res = await fetch(
          `/api/places-search?input=${encodeURIComponent(text)}`,
        );
        if (res.ok) {
          const d = await res.json();
          setSearchResults(d.predictions || []);
        }
      } catch {
      } finally {
        setSearchLoading(false);
      }
    }, 350);
  }, []);

  const handleSearchSelect = useCallback(
    async (prediction) => {
      setSearchQuery(prediction.main_text);
      setSearchResults([]);
      setShowSearch(false);
      try {
        const res = await fetch("/api/places-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ place_id: prediction.place_id }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.latitude && data.longitude) {
            const newRegion = {
              latitude: data.latitude,
              longitude: data.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            };
            mapRef.current?.animateToRegion(newRegion, 600);
            setMapRegion(newRegion);
            const nearby = pins.find((p) => {
              const d = Math.sqrt(
                Math.pow(parseFloat(p.latitude) - data.latitude, 2) +
                  Math.pow(parseFloat(p.longitude) - data.longitude, 2),
              );
              return d < 0.005;
            });
            if (nearby) {
              setTimeout(() => handlePinPress(nearby), 700);
            } else {
              setDroppedPin({
                latitude: data.latitude,
                longitude: data.longitude,
              });
              setDroppedPinName(data.name || prediction.main_text);
              setDroppedPinAddress(data.address || prediction.description);
            }
          }
        }
      } catch (err) {
        console.error("search select:", err);
      }
    },
    [pins, handlePinPress],
  );

  // ── My location ──────────────────────────────────────────────────────────────
  const goToUserLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Location permission is required.");
      return;
    }
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    mapRef.current?.animateToRegion(
      {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      800,
    );
  }, []);

  // ── Open Add Tip ─────────────────────────────────────────────────────────────
  const openAddTip = useCallback(
    (forPin = null, forDropped = null) => {
      if (!user) {
        Alert.alert(
          "Sign in required",
          "You need to be signed in to add a tip.",
        );
        return;
      }
      if (forPin) {
        setAddTipLocation({
          id: forPin.id,
          name: forPin.name,
          address: forPin.address,
          latitude: parseFloat(forPin.latitude),
          longitude: parseFloat(forPin.longitude),
          category: forPin.category,
        });
      } else if (forDropped) {
        setAddTipLocation({
          id: null,
          name: droppedPinName || "Custom Location",
          address: droppedPinAddress,
          latitude: forDropped.latitude,
          longitude: forDropped.longitude,
          category: "general",
        });
      }
      setTipContent("");
      setTipCategory("recommend");
      setTipPhotoUrl(null);
      setTipSuccess(false);
      setShowAddTip(true);
      locationSheetRef.current?.close();
    },
    [user, droppedPinName, droppedPinAddress],
  );

  // ── Pick photo ────────────────────────────────────────────────────────────────
  const pickTipPhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]) {
      setTipUploading(true);
      const asset = result.assets[0];
      const { url, error } = await uploadFile({
        reactNativeAsset: {
          uri: asset.uri,
          name: "photo.jpg",
          mimeType: "image/jpeg",
        },
      });
      if (url) setTipPhotoUrl(url);
      else Alert.alert("Upload failed", error || "Could not upload photo");
      setTipUploading(false);
    }
  }, [uploadFile]);

  // ── Submit tip ────────────────────────────────────────────────────────────────
  const submitTip = useCallback(async () => {
    if (!tipContent.trim() || tipContent.trim().length < 5) {
      Alert.alert("Too short", "Please write at least 5 characters.");
      return;
    }
    if (!addTipLocation) return;
    setTipSubmitting(true);
    try {
      const res = await fetch("/api/map-tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          map_location_id: addTipLocation.id || null,
          location_name: addTipLocation.name,
          location_address: addTipLocation.address,
          location_latitude: addTipLocation.latitude,
          location_longitude: addTipLocation.longitude,
          location_category: addTipLocation.category,
          title: addTipLocation.name,
          content: tipContent.trim(),
          category: tipCategory,
          photo_url: tipPhotoUrl || null,
        }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Failed");
      }
      setTipSuccess(true);
      loadPins(activeCategory);
    } catch (err) {
      Alert.alert("Error", err.message || "Could not save tip");
    } finally {
      setTipSubmitting(false);
    }
  }, [
    tipContent,
    tipCategory,
    tipPhotoUrl,
    addTipLocation,
    activeCategory,
    loadPins,
  ]);

  const tipCount = parseInt(selectedPin?.tip_count) || 0;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />

      {/* ── MAP ─────────────────────────────────────────────────────────────── */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={mapRegion}
        onRegionChangeComplete={setMapRegion}
        onLongPress={handleLongPress}
        showsUserLocation
        showsCompass={false}
        showsMyLocationButton={false}
        toolbarEnabled={false}
        mapPadding={{ top: insets.top + 130, left: 0, right: 0, bottom: 0 }}
      >
        {clusters.map((cluster) =>
          cluster.pins.length === 1 ? (
            <PinMarker
              key={`pin_${cluster.pins[0].id}`}
              pin={cluster.pins[0]}
              onPress={() => handlePinPress(cluster.pins[0])}
            />
          ) : (
            <ClusterMarker
              key={cluster.key}
              cluster={cluster}
              onPress={() => handleClusterPress(cluster)}
            />
          ),
        )}

        {droppedPin && (
          <Marker coordinate={droppedPin} tracksViewChanges={false}>
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  backgroundColor: "#EF4444",
                  borderRadius: 20,
                  padding: 8,
                  borderWidth: 2,
                  borderColor: "#fff",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.3,
                  shadowRadius: 5,
                  elevation: 8,
                }}
              >
                <MapPin size={18} color="#fff" fill="#fff" />
              </View>
              <View
                style={{
                  width: 0,
                  height: 0,
                  borderLeftWidth: 5,
                  borderRightWidth: 5,
                  borderTopWidth: 7,
                  borderLeftColor: "transparent",
                  borderRightColor: "transparent",
                  borderTopColor: "#EF4444",
                  marginTop: -1,
                }}
              />
            </View>
          </Marker>
        )}
      </MapView>

      {/* ── SEARCH BAR ───────────────────────────────────────────────────────── */}
      <View
        style={{
          position: "absolute",
          top: insets.top + 10,
          left: 16,
          right: 16,
          zIndex: 100,
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 14,
            paddingVertical: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 10,
            elevation: 8,
            gap: 10,
          }}
        >
          <Search size={18} color="#94A3B8" />
          <TextInput
            value={searchQuery}
            onChangeText={handleSearchChange}
            onFocus={() => setShowSearch(true)}
            placeholder="Search places, cities or attractions…"
            placeholderTextColor="#94A3B8"
            style={{
              flex: 1,
              fontSize: 15,
              color: "#0F172A",
              fontWeight: "500",
            }}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setSearchResults([]);
                setShowSearch(false);
                setDroppedPin(null);
              }}
            >
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Autocomplete */}
        {showSearch && searchResults.length > 0 && (
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              marginTop: 6,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 10,
              elevation: 8,
              maxHeight: 280,
              overflow: "hidden",
            }}
          >
            {searchLoading && (
              <ActivityIndicator
                size="small"
                color="#008C8F"
                style={{ marginVertical: 12 }}
              />
            )}
            {searchResults.map((p, i) => (
              <TouchableOpacity
                key={p.place_id}
                onPress={() => handleSearchSelect(p)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderTopWidth: i > 0 ? 1 : 0,
                  borderTopColor: "#F1F5F9",
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: "#F1F5F9",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <MapPin size={16} color="#008C8F" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: "#0F172A",
                      fontWeight: "700",
                      fontSize: 14,
                    }}
                    numberOfLines={1}
                  >
                    {p.main_text}
                  </Text>
                  <Text
                    style={{ color: "#94A3B8", fontSize: 12 }}
                    numberOfLines={1}
                  >
                    {p.secondary_text}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* ── CATEGORY FILTER CHIPS ─────────────────────────────────────────────── */}
      <View
        style={{
          position: "absolute",
          top: insets.top + 74,
          left: 0,
          right: 0,
          zIndex: 99,
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          style={{ flexGrow: 0 }}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              onPress={() => {
                setActiveCategory(cat.key);
                setShowSearch(false);
                setSearchResults([]);
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor:
                  activeCategory === cat.key ? cat.color : "#fff",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <Text style={{ fontSize: 13 }}>{cat.emoji}</Text>
              <Text
                style={{
                  color: activeCategory === cat.key ? "#fff" : "#374151",
                  fontWeight: "700",
                  fontSize: 12,
                }}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── MY LOCATION BUTTON ───────────────────────────────────────────────── */}
      <TouchableOpacity
        onPress={goToUserLocation}
        style={{
          position: "absolute",
          right: 16,
          bottom: 120,
          zIndex: 99,
          backgroundColor: "#fff",
          padding: 12,
          borderRadius: 14,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 6,
        }}
      >
        <Locate size={22} color="#008C8F" />
      </TouchableOpacity>

      {/* ── DROPPED PIN ACTION CARD ───────────────────────────────────────────── */}
      {droppedPin && !showAddTip && (
        <View
          style={{
            position: "absolute",
            bottom: 100,
            left: 16,
            right: 16,
            zIndex: 99,
            backgroundColor: "#fff",
            borderRadius: 20,
            padding: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <View
              style={{
                backgroundColor: "#FEF2F2",
                padding: 8,
                borderRadius: 12,
              }}
            >
              <MapPin size={20} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              {reverseLoading ? (
                <ActivityIndicator size="small" color="#008C8F" />
              ) : (
                <>
                  <Text
                    style={{
                      color: "#0F172A",
                      fontWeight: "800",
                      fontSize: 15,
                    }}
                    numberOfLines={1}
                  >
                    {droppedPinName || "Dropped Pin"}
                  </Text>
                  {droppedPinAddress ? (
                    <Text
                      style={{ color: "#94A3B8", fontSize: 12 }}
                      numberOfLines={1}
                    >
                      {droppedPinAddress}
                    </Text>
                  ) : null}
                </>
              )}
            </View>
            <TouchableOpacity onPress={() => setDroppedPin(null)}>
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => openAddTip(null, droppedPin)}
            style={{
              backgroundColor: "#008C8F",
              borderRadius: 12,
              paddingVertical: 12,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Plus size={18} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 14 }}>
              Add a Tip Here
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading indicator */}
      {pinsLoading && (
        <View
          style={{
            position: "absolute",
            top: insets.top + 140,
            right: 16,
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 8,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          <ActivityIndicator size="small" color="#008C8F" />
          <Text style={{ color: "#64748B", fontSize: 12, fontWeight: "600" }}>
            Loading…
          </Text>
        </View>
      )}

      {/* Dismiss search overlay */}
      {showSearch && searchResults.length > 0 && (
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 90,
          }}
          activeOpacity={1}
          onPress={() => {
            setShowSearch(false);
            setSearchResults([]);
          }}
        />
      )}

      {/* ── LOCATION BOTTOM SHEET ─────────────────────────────────────────────── */}
      <BottomSheet
        ref={locationSheetRef}
        index={-1}
        snapPoints={locationSheetSnaps}
        enablePanDownToClose
        backgroundStyle={{ borderRadius: 28 }}
        handleIndicatorStyle={{ backgroundColor: "#E2E8F0", width: 40 }}
        onClose={() => {
          setSelectedPin(null);
          setLocationTips([]);
        }}
      >
        <BottomSheetScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        >
          {selectedPin && (
            <View>
              {/* Location header */}
              <View style={{ marginBottom: 16 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 10,
                    marginBottom: 4,
                  }}
                >
                  <Text style={{ fontSize: 24 }}>
                    {getCat(selectedPin.category).emoji}
                  </Text>
                  <Text
                    style={{
                      color: "#0F172A",
                      fontSize: 20,
                      fontWeight: "900",
                      flex: 1,
                    }}
                    numberOfLines={2}
                  >
                    {selectedPin.name}
                  </Text>
                </View>
                {selectedPin.address && (
                  <Text
                    style={{ color: "#94A3B8", fontSize: 13, marginLeft: 34 }}
                  >
                    📍 {selectedPin.address}
                  </Text>
                )}

                {/* Stats */}
                <View
                  style={{
                    flexDirection: "row",
                    gap: 10,
                    marginTop: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#F0FDFA",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 20,
                    }}
                  >
                    <Text
                      style={{
                        color: "#008C8F",
                        fontWeight: "800",
                        fontSize: 13,
                      }}
                    >
                      💬 {tipCount} traveller {tipCount === 1 ? "tip" : "tips"}
                    </Text>
                  </View>
                  {selectedPin.latest_tip_at && (
                    <View
                      style={{
                        backgroundColor: "#F1F5F9",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 20,
                      }}
                    >
                      <Text
                        style={{
                          color: "#64748B",
                          fontWeight: "600",
                          fontSize: 12,
                        }}
                      >
                        🕐 Latest: {fmtRelative(selectedPin.latest_tip_at)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Add a Tip CTA */}
              <TouchableOpacity
                onPress={() => openAddTip(selectedPin)}
                style={{
                  backgroundColor: "#008C8F",
                  borderRadius: 16,
                  paddingVertical: 14,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 20,
                }}
              >
                <Plus size={20} color="#fff" strokeWidth={2.5} />
                <Text
                  style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}
                >
                  Add a Tip
                </Text>
              </TouchableOpacity>

              {/* Latest tip preview */}
              {selectedPin.latest_tip_content && (
                <View
                  style={{
                    backgroundColor: "#FFFBEB",
                    borderRadius: 14,
                    padding: 14,
                    marginBottom: 20,
                    borderWidth: 1,
                    borderColor: "#FDE68A",
                  }}
                >
                  <Text
                    style={{
                      color: "#92400E",
                      fontSize: 11,
                      fontWeight: "800",
                      marginBottom: 6,
                    }}
                  >
                    💡 MOST RECENT TIP
                  </Text>
                  <Text
                    style={{ color: "#78350F", fontSize: 14, lineHeight: 20 }}
                    numberOfLines={3}
                  >
                    {selectedPin.latest_tip_content}
                  </Text>
                  {selectedPin.latest_tip_username && (
                    <Text
                      style={{ color: "#A16207", fontSize: 11, marginTop: 6 }}
                    >
                      — {selectedPin.latest_tip_username}
                    </Text>
                  )}
                </View>
              )}

              {/* Tips divider */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <View
                  style={{ flex: 1, height: 1, backgroundColor: "#E2E8F0" }}
                />
                <Text
                  style={{
                    color: "#64748B",
                    fontWeight: "800",
                    fontSize: 11,
                    paddingHorizontal: 12,
                  }}
                >
                  LATEST TRAVELLER TIPS
                </Text>
                <View
                  style={{ flex: 1, height: 1, backgroundColor: "#E2E8F0" }}
                />
              </View>

              {/* Tips list — newest first with date labels */}
              {tipsLoading ? (
                <ActivityIndicator
                  size="large"
                  color="#008C8F"
                  style={{ marginVertical: 30 }}
                />
              ) : locationTips.length === 0 ? (
                <View style={{ alignItems: "center", paddingVertical: 30 }}>
                  <Text style={{ fontSize: 36, marginBottom: 10 }}>✈️</Text>
                  <Text
                    style={{
                      color: "#94A3B8",
                      fontSize: 15,
                      textAlign: "center",
                    }}
                  >
                    No tips yet — be the first!
                  </Text>
                </View>
              ) : (
                (() => {
                  let lastLabel = "";
                  return locationTips.map((tip) => {
                    const label = fmtDateLabel(tip.created_at);
                    const showLabel = label !== lastLabel;
                    lastLabel = label;
                    return (
                      <View key={tip.id}>
                        {showLabel && (
                          <Text
                            style={{
                              color: "#94A3B8",
                              fontWeight: "800",
                              fontSize: 11,
                              marginBottom: 8,
                              marginTop: 4,
                            }}
                          >
                            {label}
                          </Text>
                        )}
                        <TipCard tip={tip} />
                      </View>
                    );
                  });
                })()
              )}
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheet>

      {/* ── ADD TIP MODAL ─────────────────────────────────────────────────────── */}
      <Modal
        visible={showAddTip}
        animationType="slide"
        transparent={false}
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
            {/* Header */}
            <View
              style={{
                backgroundColor: "#fff",
                paddingTop: insets.top + 10,
                paddingBottom: 16,
                paddingHorizontal: 20,
                flexDirection: "row",
                alignItems: "center",
                borderBottomWidth: 1,
                borderBottomColor: "#E2E8F0",
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setShowAddTip(false);
                  setTipSuccess(false);
                }}
                style={{ marginRight: 14 }}
              >
                <X size={22} color="#64748B" />
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ color: "#0F172A", fontSize: 18, fontWeight: "900" }}
                >
                  Add a Tip
                </Text>
                {addTipLocation && (
                  <Text
                    style={{ color: "#94A3B8", fontSize: 12 }}
                    numberOfLines={1}
                  >
                    📍 {addTipLocation.name}
                  </Text>
                )}
              </View>
            </View>

            {tipSuccess ? (
              /* Success */
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 40,
                }}
              >
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: "#F0FDFA",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <CheckCircle size={44} color="#10B981" />
                </View>
                <Text
                  style={{
                    color: "#0F172A",
                    fontSize: 22,
                    fontWeight: "900",
                    marginBottom: 10,
                    textAlign: "center",
                  }}
                >
                  Tip Published! 🎉
                </Text>
                <Text
                  style={{
                    color: "#94A3B8",
                    fontSize: 15,
                    textAlign: "center",
                    marginBottom: 32,
                  }}
                >
                  Your tip is now live on the TipTrip map. Thanks for helping
                  fellow travellers!
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowAddTip(false);
                    setTipSuccess(false);
                  }}
                  style={{
                    backgroundColor: "#008C8F",
                    borderRadius: 16,
                    paddingHorizontal: 32,
                    paddingVertical: 16,
                    width: "100%",
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "900",
                      fontSize: 16,
                      textAlign: "center",
                    }}
                  >
                    Back to Map
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
              >
                {/* Location preview */}
                {addTipLocation && (
                  <View
                    style={{
                      backgroundColor: "#F0FDFA",
                      borderRadius: 16,
                      padding: 14,
                      marginBottom: 20,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "#008C8F20",
                        padding: 8,
                        borderRadius: 12,
                      }}
                    >
                      <MapPin size={20} color="#008C8F" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: "#0F172A",
                          fontWeight: "800",
                          fontSize: 15,
                        }}
                      >
                        {addTipLocation.name}
                      </Text>
                      {addTipLocation.address ? (
                        <Text
                          style={{ color: "#64748B", fontSize: 12 }}
                          numberOfLines={1}
                        >
                          {addTipLocation.address}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                )}

                {/* Tip type */}
                <Text
                  style={{
                    color: "#374151",
                    fontWeight: "800",
                    fontSize: 14,
                    marginBottom: 10,
                  }}
                >
                  Your tip type
                </Text>
                <View
                  style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}
                >
                  {TIP_CATS.map((tc) => (
                    <TouchableOpacity
                      key={tc.key}
                      onPress={() => setTipCategory(tc.key)}
                      style={{
                        flex: 1,
                        padding: 12,
                        borderRadius: 14,
                        alignItems: "center",
                        backgroundColor:
                          tipCategory === tc.key ? tc.color : "#F1F5F9",
                        borderWidth: 2,
                        borderColor:
                          tipCategory === tc.key ? tc.color : "transparent",
                      }}
                    >
                      <Text style={{ fontSize: 20, marginBottom: 4 }}>
                        {tc.emoji}
                      </Text>
                      <Text
                        style={{
                          color: tipCategory === tc.key ? "#fff" : "#374151",
                          fontWeight: "800",
                          fontSize: 12,
                        }}
                      >
                        {tc.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Content */}
                <Text
                  style={{
                    color: "#374151",
                    fontWeight: "800",
                    fontSize: 14,
                    marginBottom: 10,
                  }}
                >
                  Your tip *
                </Text>
                <TextInput
                  value={tipContent}
                  onChangeText={setTipContent}
                  multiline
                  placeholder="Share something useful for travellers visiting this place…"
                  placeholderTextColor="#94A3B8"
                  style={{
                    backgroundColor: "#fff",
                    borderWidth: 1.5,
                    borderColor: "#E2E8F0",
                    borderRadius: 16,
                    padding: 16,
                    fontSize: 15,
                    color: "#0F172A",
                    lineHeight: 22,
                    minHeight: 120,
                    textAlignVertical: "top",
                    marginBottom: 20,
                  }}
                />

                {/* Photo */}
                <Text
                  style={{
                    color: "#374151",
                    fontWeight: "800",
                    fontSize: 14,
                    marginBottom: 10,
                  }}
                >
                  Photo (optional)
                </Text>
                {tipPhotoUrl ? (
                  <View style={{ marginBottom: 20 }}>
                    <Image
                      source={{ uri: tipPhotoUrl }}
                      style={{ width: "100%", height: 180, borderRadius: 16 }}
                      contentFit="cover"
                    />
                    <TouchableOpacity
                      onPress={() => setTipPhotoUrl(null)}
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        borderRadius: 20,
                        padding: 6,
                      }}
                    >
                      <X size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={pickTipPhoto}
                    disabled={tipUploading}
                    style={{
                      backgroundColor: "#F1F5F9",
                      borderRadius: 16,
                      padding: 20,
                      alignItems: "center",
                      borderWidth: 2,
                      borderColor: "#E2E8F0",
                      borderStyle: "dashed",
                      marginBottom: 20,
                    }}
                  >
                    {tipUploading ? (
                      <ActivityIndicator color="#008C8F" />
                    ) : (
                      <>
                        <Camera size={28} color="#94A3B8" />
                        <Text
                          style={{
                            color: "#94A3B8",
                            fontWeight: "700",
                            marginTop: 8,
                          }}
                        >
                          Tap to add a photo
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                {/* Submit */}
                <TouchableOpacity
                  onPress={submitTip}
                  disabled={tipSubmitting || tipContent.trim().length < 5}
                  style={{
                    backgroundColor: "#008C8F",
                    borderRadius: 16,
                    paddingVertical: 16,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 10,
                    opacity:
                      tipSubmitting || tipContent.trim().length < 5 ? 0.6 : 1,
                  }}
                >
                  {tipSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Send size={20} color="#fff" />
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "900",
                          fontSize: 17,
                        }}
                      >
                        Publish Tip
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
