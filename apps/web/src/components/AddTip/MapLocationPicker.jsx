"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import {
  MapPin,
  Search,
  Crosshair,
  X,
  Check,
  Loader2,
  Navigation,
  Locate,
} from "lucide-react";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const DEFAULT_CENTER = { lat: 20, lng: 0 };
const DEFAULT_ZOOM = 3;

export function MapLocationPicker({
  locationName,
  locationLatitude,
  locationLongitude,
  onLocationChange,
  onCoordinatesChange,
  destinationLat,
  destinationLng,
  destinationName,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const [pinPosition, setPinPosition] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [reverseGeoName, setReverseGeoName] = useState("");
  const [reverseLoading, setReverseLoading] = useState(false);
  const searchTimerRef = useRef(null);
  const searchBoxRef = useRef(null);

  // Center on destination when selected
  useEffect(() => {
    if (destinationLat && destinationLng) {
      const lat = parseFloat(destinationLat);
      const lng = parseFloat(destinationLng);
      if (!isNaN(lat) && !isNaN(lng)) {
        setMapCenter({ lat, lng });
        setMapZoom(12);
      }
    }
  }, [destinationLat, destinationLng]);

  // Show existing pin
  useEffect(() => {
    if (locationLatitude && locationLongitude) {
      const lat = parseFloat(locationLatitude);
      const lng = parseFloat(locationLongitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        setPinPosition({ lat, lng });
      }
    }
  }, [locationLatitude, locationLongitude]);

  // Close search on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
        console.error("Location search error:", err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  }, []);

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
            const newPos = { lat: details.latitude, lng: details.longitude };
            setMapCenter(newPos);
            setMapZoom(17);
            setPinPosition(newPos);
            setReverseGeoName(prediction.description);
            onLocationChange(prediction.description);
            onCoordinatesChange(details.latitude, details.longitude);
          }
        }
      } catch (err) {
        console.error("Error getting place details:", err);
      }
    },
    [onLocationChange, onCoordinatesChange],
  );

  const handleMapClick = useCallback(
    async (event) => {
      const lat = event.detail.latLng.lat;
      const lng = event.detail.latLng.lng;
      const newPos = { lat, lng };
      setPinPosition(newPos);
      onCoordinatesChange(lat, lng);

      // Try reverse geocoding via server-side proxy
      setReverseLoading(true);
      try {
        const res = await fetch("/api/places-search", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude: lat, longitude: lng }),
        });
        if (res.ok) {
          const data = await res.json();
          // Check if the address is a real address (not just coords fallback)
          const isRealAddress =
            data.address && !data.address.match(/^[\d., -]+$/);
          if (isRealAddress) {
            setReverseGeoName(data.address);
            onLocationChange(data.address);
          } else {
            // No real address found — set a friendly location label
            const friendlyLabel = "Pinned location";
            setReverseGeoName(friendlyLabel);
            onLocationChange(friendlyLabel);
          }
        }
      } catch (err) {
        console.error("Reverse geocode error:", err);
        setReverseGeoName("Pinned location");
        onLocationChange("Pinned location");
      } finally {
        setReverseLoading(false);
      }
    },
    [onLocationChange, onCoordinatesChange],
  );

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setMapCenter({ lat, lng });
        setMapZoom(16);
      },
      (err) => console.error("Geolocation error:", err),
    );
  }, []);

  const handleClearPin = useCallback(() => {
    setPinPosition(null);
    setReverseGeoName("");
    onLocationChange("");
    onCoordinatesChange(null, null);
  }, [onLocationChange, onCoordinatesChange]);

  const hasPin = pinPosition !== null;
  const displayAddress = reverseGeoName || locationName || "";
  const coordsText = hasPin
    ? pinPosition.lat.toFixed(6) + ", " + pinPosition.lng.toFixed(6)
    : "";

  return (
    <div className="mb-6">
      <label className="text-[#1E1E1E] font-bold text-sm mb-3 block">
        <MapPin className="w-4 h-4 inline mr-2 text-[#10B981]" />
        Pin Your Location *
      </label>

      {/* Collapsed — summary or prompt */}
      {!isExpanded && (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-left shadow-sm hover:border-[#008C8F] transition-all group"
        >
          {hasPin ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-[#10B981]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {displayAddress}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{coordsText}</p>
              </div>
              <span className="text-xs font-bold text-[#008C8F] bg-[#008C8F]/5 px-3 py-1.5 rounded-lg group-hover:bg-[#008C8F]/10 transition-colors">
                Change
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <Crosshair className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-400">
                  Tap to open the map and pin your exact location
                </p>
                <p className="text-xs text-gray-300 mt-0.5">
                  Search or click to drop a pin
                </p>
              </div>
              <MapPin className="w-5 h-5 text-gray-300 group-hover:text-[#008C8F] transition-colors" />
            </div>
          )}
        </button>
      )}

      {/* Expanded — full map */}
      {isExpanded && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Search bar */}
          <div
            className="p-3 border-b border-gray-100 relative"
            ref={searchBoxRef}
          >
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-200 focus-within:border-[#008C8F] transition-all">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search for a place, street, or area…"
                  className="flex-1 text-sm bg-transparent focus:outline-none text-gray-900 placeholder-gray-400"
                  autoFocus
                />
                {searchLoading && (
                  <Loader2
                    className="w-4 h-4 text-[#008C8F] shrink-0"
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                )}
              </div>
              <button
                onClick={handleLocateMe}
                className="bg-gray-50 border border-gray-200 p-2.5 rounded-xl hover:border-[#008C8F] hover:bg-[#008C8F]/5 transition-all"
                title="Use my location"
              >
                <Locate className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="bg-gray-50 border border-gray-200 p-2.5 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all"
                title="Close map"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Search results */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute left-3 right-3 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                {searchResults.map((prediction) => (
                  <button
                    key={prediction.place_id}
                    type="button"
                    onClick={() => handleSelectSearchResult(prediction)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-3 border-b border-gray-100 last:border-0 transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-[#008C8F] shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {prediction.main_text || prediction.description}
                      </p>
                      {prediction.secondary_text && (
                        <p className="text-xs text-gray-400 truncate">
                          {prediction.secondary_text}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Instruction */}
          <div className="bg-gradient-to-r from-[#008C8F]/5 to-[#7DE2D1]/5 px-4 py-2 flex items-center gap-2 border-b border-gray-100">
            <Crosshair className="w-3.5 h-3.5 text-[#008C8F]" />
            <p className="text-xs font-semibold text-[#008C8F]">
              Click anywhere on the map to drop a pin at the exact location
            </p>
          </div>

          {/* Google Map */}
          <div style={{ width: "100%", height: 400 }}>
            <APIProvider apiKey={API_KEY}>
              <Map
                style={{ width: "100%", height: "100%" }}
                center={mapCenter}
                zoom={mapZoom}
                onCenterChanged={(e) => setMapCenter(e.detail.center)}
                onZoomChanged={(e) => setMapZoom(e.detail.zoom)}
                gestureHandling="greedy"
                disableDefaultUI={false}
                mapTypeControl={true}
                zoomControl={true}
                streetViewControl={true}
                fullscreenControl={false}
                mapId="tip-location-picker"
                onClick={handleMapClick}
              >
                {/* Destination reference marker */}
                {destinationLat && destinationLng && !hasPin && (
                  <AdvancedMarker
                    position={{
                      lat: parseFloat(destinationLat),
                      lng: parseFloat(destinationLng),
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-gray-400 border-2 border-white shadow-lg flex items-center justify-center">
                        <MapPin className="w-3 h-3 text-white" />
                      </div>
                      <div className="bg-white/90 px-2 py-0.5 rounded mt-1 shadow-sm">
                        <span className="text-[9px] font-bold text-gray-500 whitespace-nowrap">
                          {destinationName}
                        </span>
                      </div>
                    </div>
                  </AdvancedMarker>
                )}

                {/* User's dropped pin */}
                {hasPin && (
                  <AdvancedMarker position={pinPosition}>
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div
                          className="w-8 h-8 rounded-full bg-[#10B981] shadow-lg flex items-center justify-center"
                          style={{
                            borderWidth: 3,
                            borderColor: "white",
                            borderStyle: "solid",
                          }}
                        >
                          <MapPin className="w-4 h-4 text-white" fill="white" />
                        </div>
                        <div
                          className="absolute inset-0 rounded-full border-2 border-[#10B981]"
                          style={{
                            animation: "pulse-ring 2s ease-out infinite",
                            opacity: 0.4,
                          }}
                        />
                      </div>
                    </div>
                  </AdvancedMarker>
                )}
              </Map>
            </APIProvider>
          </div>

          {/* Bottom info bar */}
          <div className="p-3 border-t border-gray-100 bg-gray-50/50">
            {hasPin ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-[#10B981]" />
                </div>
                <div className="flex-1 min-w-0">
                  {reverseLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2
                        className="w-3.5 h-3.5 text-[#008C8F]"
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                      <span className="text-xs text-gray-400">
                        Getting address…
                      </span>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {displayAddress}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {coordsText}
                      </p>
                    </>
                  )}
                </div>
                <button
                  onClick={handleClearPin}
                  className="text-xs font-bold text-red-500 bg-red-50 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-xs font-bold text-white bg-[#10B981] px-3 py-1.5 rounded-lg hover:bg-[#059669] transition-colors"
                >
                  Confirm
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-center py-1">
                <Navigation className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-xs text-gray-400 font-semibold">
                  Search or click on the map to pin the exact location
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
