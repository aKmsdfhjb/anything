import { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Platform,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import {
  MapPin,
  Search,
  Crosshair,
  X,
  Check,
  Navigation,
  Locate,
} from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function MapLocationPicker({
  location,
  locationName,
  onLocationChange,
  destinationLat,
  destinationLng,
  destinationName,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [pinPosition, setPinPosition] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [reverseGeoName, setReverseGeoName] = useState("");
  const [reverseLoading, setReverseLoading] = useState(false);
  const searchTimerRef = useRef(null);
  const mapRef = useRef(null);

  // Initialize pin from existing location
  useEffect(() => {
    if (location?.latitude && location?.longitude) {
      setPinPosition({
        latitude: location.latitude,
        longitude: location.longitude,
      });
      if (locationName) {
        setReverseGeoName(locationName);
      }
    }
  }, [location, locationName]);

  // Animate to destination when expanded
  useEffect(() => {
    if (isExpanded && mapRef.current && destinationLat && destinationLng) {
      const lat = parseFloat(destinationLat);
      const lng = parseFloat(destinationLng);
      if (!isNaN(lat) && !isNaN(lng)) {
        setTimeout(() => {
          mapRef.current?.animateToRegion(
            {
              latitude: lat,
              longitude: lng,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            },
            500,
          );
        }, 300);
      }
    }
  }, [isExpanded, destinationLat, destinationLng]);

  // Search places
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    setSearchLoading(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/places-search?input=${encodeURIComponent(query)}`,
        );
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setSearchResults(data.predictions || []);
        setShowSearchResults(true);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  }, []);

  // Select a search result
  const handleSelectSearchResult = useCallback(
    async (prediction) => {
      setSearchQuery(prediction.description);
      setShowSearchResults(false);
      setSearchResults([]);
      try {
        const res = await fetch("/api/places-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ place_id: prediction.place_id }),
        });
        if (res.ok) {
          const details = await res.json();
          if (details.latitude && details.longitude) {
            const newPos = {
              latitude: details.latitude,
              longitude: details.longitude,
            };
            setPinPosition(newPos);
            setReverseGeoName(prediction.description);
            onLocationChange(newPos, prediction.description);
            mapRef.current?.animateToRegion(
              {
                ...newPos,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              },
              500,
            );
          }
        }
      } catch (err) {
        console.error("Place details error:", err);
      }
    },
    [onLocationChange],
  );

  // Tap on map to drop pin
  const handleMapPress = useCallback(
    async (event) => {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      const newPos = { latitude, longitude };
      setPinPosition(newPos);

      // Reverse geocode
      setReverseLoading(true);
      try {
        const addresses = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        if (addresses && addresses.length > 0) {
          const addr = addresses[0];
          const parts = [
            addr.name,
            addr.street,
            addr.city,
            addr.region,
            addr.country,
          ].filter(Boolean);
          const name = parts.join(", ");
          setReverseGeoName(name);
          onLocationChange(newPos, name);
        } else {
          const fallback = "Pinned location";
          setReverseGeoName(fallback);
          onLocationChange(newPos, fallback);
        }
      } catch (err) {
        console.error("Reverse geocode error:", err);
        const fallback = "Pinned location";
        setReverseGeoName(fallback);
        onLocationChange(newPos, fallback);
      } finally {
        setReverseLoading(false);
      }
    },
    [onLocationChange],
  );

  // Use current location
  const handleLocateMe = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = position.coords;
      mapRef.current?.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        500,
      );
    } catch (err) {
      console.error("Location error:", err);
    }
  }, []);

  // Clear pin
  const handleClearPin = useCallback(() => {
    setPinPosition(null);
    setReverseGeoName("");
    onLocationChange(null, "");
  }, [onLocationChange]);

  const hasPin = pinPosition !== null;
  const displayAddress = reverseGeoName || locationName || "";
  const coordsText = hasPin
    ? pinPosition.latitude.toFixed(6) + ", " + pinPosition.longitude.toFixed(6)
    : "";

  const initialRegion = {
    latitude: destinationLat ? parseFloat(destinationLat) : 20,
    longitude: destinationLng ? parseFloat(destinationLng) : 0,
    latitudeDelta: destinationLat ? 0.05 : 100,
    longitudeDelta: destinationLng ? 0.05 : 100,
  };

  return (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: "#374151",
          marginBottom: 8,
        }}
      >
        📍 Pin Your Location
      </Text>

      {/* Collapsed */}
      {!isExpanded && (
        <TouchableOpacity
          onPress={() => setIsExpanded(true)}
          activeOpacity={0.7}
          style={{
            backgroundColor: "#fff",
            padding: 16,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: hasPin ? "#10B981" : "#E5E7EB",
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: hasPin ? "#10B98115" : "#F3F4F6",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {hasPin ? (
              <MapPin size={20} color="#10B981" />
            ) : (
              <Crosshair size={20} color="#9CA3AF" />
            )}
          </View>
          <View style={{ flex: 1 }}>
            {hasPin ? (
              <>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: "#111827",
                  }}
                >
                  {displayAddress}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: "#9CA3AF",
                    marginTop: 2,
                  }}
                >
                  {coordsText}
                </Text>
              </>
            ) : (
              <>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#9CA3AF",
                  }}
                >
                  Tap to open the map
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: "#D1D5DB",
                    marginTop: 2,
                  }}
                >
                  Search or tap to drop a pin
                </Text>
              </>
            )}
          </View>
          {hasPin ? (
            <View
              style={{
                backgroundColor: "#008C8F10",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: "#008C8F",
                }}
              >
                Change
              </Text>
            </View>
          ) : (
            <MapPin size={20} color="#D1D5DB" />
          )}
        </TouchableOpacity>
      )}

      {/* Expanded Map */}
      {isExpanded && (
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "#E5E7EB",
          }}
        >
          {/* Search bar */}
          <View
            style={{
              padding: 12,
              borderBottomWidth: 1,
              borderBottomColor: "#F3F4F6",
              zIndex: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#F9FAFB",
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: Platform.OS === "ios" ? 10 : 0,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  gap: 8,
                }}
              >
                <Search size={16} color="#9CA3AF" />
                <TextInput
                  value={searchQuery}
                  onChangeText={handleSearch}
                  placeholder="Search for a place…"
                  placeholderTextColor="#9CA3AF"
                  style={{
                    flex: 1,
                    fontSize: 14,
                    color: "#111827",
                    paddingVertical: Platform.OS === "android" ? 8 : 0,
                  }}
                  returnKeyType="search"
                />
                {searchLoading && (
                  <ActivityIndicator size="small" color="#008C8F" />
                )}
              </View>
              <TouchableOpacity
                onPress={handleLocateMe}
                style={{
                  backgroundColor: "#F9FAFB",
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  padding: 10,
                  borderRadius: 12,
                }}
              >
                <Locate size={16} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsExpanded(false)}
                style={{
                  backgroundColor: "#F9FAFB",
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  padding: 10,
                  borderRadius: 12,
                }}
              >
                <X size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Search results dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <View
                style={{
                  position: "absolute",
                  left: 12,
                  right: 12,
                  top: 60,
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  maxHeight: 200,
                  zIndex: 20,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                {searchResults.map((prediction) => (
                  <TouchableOpacity
                    key={prediction.place_id}
                    onPress={() => handleSelectSearchResult(prediction)}
                    style={{
                      padding: 14,
                      borderBottomWidth: 1,
                      borderBottomColor: "#F3F4F6",
                      flexDirection: "row",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
                    <MapPin
                      size={16}
                      color="#008C8F"
                      style={{ marginTop: 2 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        numberOfLines={1}
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: "#111827",
                        }}
                      >
                        {prediction.main_text || prediction.description}
                      </Text>
                      {prediction.secondary_text ? (
                        <Text
                          numberOfLines={1}
                          style={{
                            fontSize: 11,
                            color: "#9CA3AF",
                            marginTop: 2,
                          }}
                        >
                          {prediction.secondary_text}
                        </Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Instruction banner */}
          <View
            style={{
              backgroundColor: "#008C8F08",
              paddingHorizontal: 16,
              paddingVertical: 8,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              borderBottomWidth: 1,
              borderBottomColor: "#F3F4F6",
            }}
          >
            <Crosshair size={14} color="#008C8F" />
            <Text style={{ fontSize: 11, fontWeight: "600", color: "#008C8F" }}>
              Tap anywhere on the map to drop a pin
            </Text>
          </View>

          {/* Map */}
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={{ width: "100%", height: 300 }}
            initialRegion={initialRegion}
            onPress={handleMapPress}
            showsUserLocation
            showsMyLocationButton={false}
            mapType="standard"
          >
            {/* Destination reference marker */}
            {destinationLat && destinationLng && !hasPin && (
              <Marker
                coordinate={{
                  latitude: parseFloat(destinationLat),
                  longitude: parseFloat(destinationLng),
                }}
                title={destinationName || "Destination"}
                pinColor="#9CA3AF"
              />
            )}

            {/* User's dropped pin */}
            {hasPin && (
              <Marker
                coordinate={pinPosition}
                title={displayAddress || "Pinned location"}
                pinColor="#10B981"
              />
            )}
          </MapView>

          {/* Bottom info bar */}
          <View
            style={{
              padding: 12,
              borderTopWidth: 1,
              borderTopColor: "#F3F4F6",
              backgroundColor: "#FAFAFA",
            }}
          >
            {hasPin ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: "#10B98115",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Check size={16} color="#10B981" />
                </View>
                <View style={{ flex: 1 }}>
                  {reverseLoading ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <ActivityIndicator size="small" color="#008C8F" />
                      <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                        Getting address…
                      </Text>
                    </View>
                  ) : (
                    <>
                      <Text
                        numberOfLines={1}
                        style={{
                          fontSize: 12,
                          fontWeight: "700",
                          color: "#111827",
                        }}
                      >
                        {displayAddress}
                      </Text>
                      <Text
                        style={{
                          fontSize: 10,
                          color: "#9CA3AF",
                          marginTop: 2,
                        }}
                      >
                        {coordsText}
                      </Text>
                    </>
                  )}
                </View>
                <TouchableOpacity
                  onPress={handleClearPin}
                  style={{
                    backgroundColor: "#FEE2E2",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      color: "#EF4444",
                    }}
                  >
                    Clear
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsExpanded(false)}
                  style={{
                    backgroundColor: "#10B981",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      color: "#fff",
                    }}
                  >
                    Confirm
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  paddingVertical: 4,
                }}
              >
                <Navigation size={14} color="#9CA3AF" />
                <Text
                  style={{
                    fontSize: 11,
                    color: "#9CA3AF",
                    fontWeight: "600",
                  }}
                >
                  Search or tap the map to pin your location
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}
