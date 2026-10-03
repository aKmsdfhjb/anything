"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import {
  MapPin,
  Globe,
  Filter,
  Plus,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  X,
  Sparkles,
  Plane,
  Calendar,
  Users,
  PlusCircle,
} from "lucide-react";
import useUser from "@/utils/useUser";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const CATEGORY_COLORS = {
  recommend: { bg: "#10B981", label: "Recommend", emoji: "👍" },
  avoid: { bg: "#EF4444", label: "Avoid", emoji: "👎" },
  safety_warning: { bg: "#F59E0B", label: "Warning", emoji: "⚠️" },
};

export default function FlatMapPage() {
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedDest, setSelectedDest] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [affiliateLinks, setAffiliateLinks] = useState([]);
  const [addTripMode, setAddTripMode] = useState(false);
  const [newTripData, setNewTripData] = useState(null);
  const [tripForm, setTripForm] = useState({
    trip_name: "",
    start_date: "",
    end_date: "",
    notes: "",
    share_description: "",
  });

  const { data: mapData, isLoading } = useQuery({
    queryKey: ["map-points", filterCategory],
    queryFn: async () => {
      const url =
        filterCategory === "all"
          ? "/api/map-points"
          : `/api/map-points?category=${filterCategory}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load map data");
      return res.json();
    },
  });

  const { data: allDestinations } = useQuery({
    queryKey: ["destinations-all"],
    queryFn: async () => {
      const res = await fetch("/api/destinations");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const destinations = mapData?.destinations || [];
  const trips = mapData?.trips || [];
  const everyDestination = allDestinations?.destinations || [];

  // Destinations with tips or trips
  const activeDestNames = useMemo(() => {
    const tipDests = new Set(destinations.map((d) => d.destination_name));
    const tripDests = new Set(trips.map((t) => t.destination_name));
    return new Set([...tipDests, ...tripDests]);
  }, [destinations, trips]);

  // Destinations without tips or trips (just city markers)
  const untippedDestinations = useMemo(() => {
    return everyDestination.filter((d) => !activeDestNames.has(d.name));
  }, [everyDestination, activeDestNames]);

  const createTripMutation = useMutation({
    mutationFn: async (tripData) => {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tripData),
      });
      if (!res.ok) throw new Error("Failed to create trip");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["map-points"] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      setAddTripMode(false);
      setNewTripData(null);
      setTripForm({
        trip_name: "",
        start_date: "",
        end_date: "",
        notes: "",
        share_description: "",
      });
    },
  });

  const handleMapClick = useCallback(
    async (event) => {
      if (!addTripMode || !user) return;

      const lat = event.detail.latLng.lat;
      const lng = event.detail.latLng.lng;

      // Find closest destination for this click
      let closestDest = null;
      let minDistance = Infinity;

      everyDestination.forEach((dest) => {
        const distance = Math.sqrt(
          Math.pow(parseFloat(dest.latitude) - lat, 2) +
            Math.pow(parseFloat(dest.longitude) - lng, 2),
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestDest = dest;
        }
      });

      if (closestDest) {
        setNewTripData({
          destination_id: closestDest.id,
          destination_name: closestDest.name,
          country: closestDest.country,
          lat,
          lng,
        });
      }
    },
    [addTripMode, user, everyDestination],
  );

  const handleMarkerClick = useCallback(async (dest) => {
    setSelectedDest(dest);
    setSelectedTrip(null);
    // Fetch affiliate links
    const name = dest.destination_name || dest.name;
    const country = dest.destination_country || dest.country;
    try {
      const res = await fetch(
        `/api/affiliates/links?destination=${encodeURIComponent(name)}&country=${encodeURIComponent(country)}`,
      );
      if (res.ok) {
        const data = await res.json();
        setAffiliateLinks(data.links || []);
      }
    } catch (e) {
      console.error("Error fetching links:", e);
    }
  }, []);

  const handleTripClick = useCallback((trip) => {
    setSelectedTrip(trip);
    setSelectedDest(null);
  }, []);

  const handleSubmitTrip = () => {
    if (!newTripData || !tripForm.trip_name || !tripForm.start_date) return;

    createTripMutation.mutate({
      destination_id: newTripData.destination_id,
      trip_name: tripForm.trip_name,
      start_date: tripForm.start_date,
      end_date: tripForm.end_date || null,
      notes: tripForm.notes,
      status: "planned",
    });
  };

  const groupedLinks = useMemo(() => {
    const grouped = {};
    affiliateLinks.forEach((link) => {
      if (!grouped[link.category]) grouped[link.category] = [];
      grouped[link.category].push(link);
    });
    return grouped;
  }, [affiliateLinks]);

  const selectedName =
    selectedDest?.destination_name || selectedDest?.name || "";
  const selectedCountry =
    selectedDest?.destination_country || selectedDest?.country || "";
  const selectedLat = parseFloat(selectedDest?.latitude || 0);
  const selectedLng = parseFloat(selectedDest?.longitude || 0);

  const selectedTripLat = parseFloat(selectedTrip?.marker_latitude || 0);
  const selectedTripLng = parseFloat(selectedTrip?.marker_longitude || 0);

  return (
    <div className="min-h-screen bg-[#F4F6F8] relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-white/90 to-transparent pt-4 px-5 pb-16">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="w-7 h-7 text-[#008C8F]" />
            <h1 className="text-2xl md:text-3xl font-black text-[#1E1E1E]">
              Trip Map
            </h1>
            {!isLoading && (
              <div className="flex gap-2">
                <span className="bg-[#008C8F]/15 text-[#008C8F] text-xs font-bold px-3 py-1 rounded-full">
                  {everyDestination.length} cities
                </span>
                <span className="bg-[#7DE2D1]/15 text-[#008C8F] text-xs font-bold px-3 py-1 rounded-full">
                  {trips.length} trips
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/map"
              className="bg-white border border-gray-200 text-[#1E1E1E] font-bold py-2 px-4 rounded-xl text-sm flex items-center gap-2 hover:border-[#7DE2D1] transition-all shadow-sm"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">3D Globe</span>
            </a>
            {user && (
              <button
                onClick={() => setAddTripMode(!addTripMode)}
                className={`font-bold py-2 px-4 rounded-xl text-sm flex items-center gap-2 transition-all ${
                  addTripMode
                    ? "bg-red-500 text-white"
                    : "bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] text-white"
                }`}
              >
                {addTripMode ? (
                  <>
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Cancel</span>
                  </>
                ) : (
                  <>
                    <Plane className="w-4 h-4" />
                    <span className="hidden sm:inline">Pin Trip</span>
                  </>
                )}
              </button>
            )}
            <a
              href="/add-tip"
              className="bg-white border border-gray-200 text-[#1E1E1E] font-bold py-2 px-4 rounded-xl text-sm flex items-center gap-2 hover:border-[#7DE2D1] transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Tip</span>
            </a>
          </div>
        </div>
      </div>

      {/* Pin Trip Mode Banner */}
      {addTripMode && (
        <div className="absolute top-20 left-0 right-0 z-20 px-5">
          <div className="max-w-7xl mx-auto bg-[#7DE2D1]/20 border border-[#7DE2D1] rounded-xl p-4">
            <div className="flex items-center gap-2 text-[#008C8F]">
              <PlusCircle className="w-5 h-5" />
              <span className="font-bold">Pin Trip Mode Active</span>
              <span className="text-sm opacity-75">
                — Click anywhere on the map to pin a trip
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div
        className={`absolute ${addTripMode ? "top-32" : "top-16"} left-0 right-0 z-20 px-5`}
      >
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          {[
            { value: "all", label: "All", color: "#008C8F" },
            { value: "recommend", label: "👍 Recommend", color: "#10B981" },
            { value: "avoid", label: "👎 Avoid", color: "#EF4444" },
            { value: "safety_warning", label: "⚠️ Warnings", color: "#F59E0B" },
          ].map((f) => {
            const isActive = filterCategory === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setFilterCategory(f.value)}
                className="shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all border"
                style={{
                  borderColor: isActive ? f.color : "#E5E7EB",
                  backgroundColor: isActive ? f.color + "15" : "#FFFFFF",
                  color: isActive ? f.color : "#6B7280",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/90 border border-gray-200 rounded-2xl p-4 hidden md:block backdrop-blur-sm shadow-sm">
        <p className="text-gray-400 text-xs font-bold mb-2 uppercase">Legend</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#10B981]" />
            <span className="text-xs text-gray-600">👍 Recommended</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
            <span className="text-xs text-gray-600">👎 Avoid</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
            <span className="text-xs text-gray-600">⚠️ Warning</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-gray-200">
            <Plane className="w-3 h-3 text-[#7DE2D1]" />
            <span className="text-xs text-gray-600">✈️ Trip</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400 border border-gray-500" />
            <span className="text-xs text-gray-400">City (no content)</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <APIProvider apiKey={API_KEY}>
        <Map
          style={{ width: "100%", height: "100vh" }}
          defaultCenter={{ lat: 20, lng: 0 }}
          defaultZoom={3}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapTypeControl={true}
          zoomControl={true}
          streetViewControl={false}
          fullscreenControl={false}
          mapId="flat-map-styled"
          onClick={handleMapClick}
        >
          {/* Destinations WITH tips — colored markers */}
          {destinations.map((dest) => {
            let dominantCategory = "recommend";
            if (
              dest.avoid_count > dest.recommend_count &&
              dest.avoid_count > dest.warning_count
            )
              dominantCategory = "avoid";
            else if (dest.warning_count > dest.recommend_count)
              dominantCategory = "safety_warning";
            const color = CATEGORY_COLORS[dominantCategory]?.bg || "#008C8F";

            return (
              <AdvancedMarker
                key={dest.destination_name}
                position={{
                  lat: parseFloat(dest.latitude),
                  lng: parseFloat(dest.longitude),
                }}
                onClick={() => handleMarkerClick(dest)}
              >
                <div
                  className="flex flex-col items-center"
                  style={{ cursor: "pointer" }}
                >
                  <div
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full shadow-lg border-2 border-white"
                    style={{ backgroundColor: color }}
                  >
                    <span className="text-white text-xs font-black">
                      {dest.tip_count}
                    </span>
                    <MapPin className="w-3 h-3 text-white" fill="white" />
                  </div>
                  <div className="bg-white/90 px-2 py-0.5 rounded mt-1 backdrop-blur-sm shadow-sm">
                    <span className="text-[#1E1E1E] text-[10px] font-bold whitespace-nowrap">
                      {dest.destination_name}
                    </span>
                  </div>
                </div>
              </AdvancedMarker>
            );
          })}

          {/* Destinations WITHOUT tips — simple gray markers with label */}
          {untippedDestinations.map((dest) => (
            <AdvancedMarker
              key={`city-${dest.id}`}
              position={{
                lat: parseFloat(dest.latitude),
                lng: parseFloat(dest.longitude),
              }}
              onClick={() => handleMarkerClick(dest)}
            >
              <div
                className="flex flex-col items-center"
                style={{ cursor: "pointer" }}
              >
                <div className="w-3 h-3 rounded-full bg-gray-400 border-2 border-white shadow-md" />
                <div className="bg-white/80 px-1.5 py-0.5 rounded mt-0.5">
                  <span className="text-gray-500 text-[9px] font-semibold whitespace-nowrap">
                    {dest.name}
                  </span>
                </div>
              </div>
            </AdvancedMarker>
          ))}

          {/* Trip markers */}
          {trips.map((trip) => {
            const isUpcoming = new Date(trip.start_date) > new Date();
            const isCompleted = trip.status === "completed";

            return (
              <AdvancedMarker
                key={`trip-${trip.id}`}
                position={{
                  lat: trip.marker_latitude,
                  lng: trip.marker_longitude,
                }}
                onClick={() => handleTripClick(trip)}
              >
                <div
                  className="flex flex-col items-center"
                  style={{ cursor: "pointer" }}
                >
                  <div
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full shadow-lg border-2 border-white ${
                      isCompleted
                        ? "bg-green-500"
                        : isUpcoming
                          ? "bg-[#7DE2D1]"
                          : "bg-gray-400"
                    }`}
                  >
                    <Plane className="w-3 h-3 text-white" fill="white" />
                    <span className="text-white text-xs font-black">
                      {isCompleted ? "✓" : isUpcoming ? "→" : "○"}
                    </span>
                  </div>
                  <div className="bg-white/90 px-2 py-0.5 rounded mt-1 backdrop-blur-sm shadow-sm">
                    <span className="text-[#1E1E1E] text-[10px] font-bold whitespace-nowrap">
                      {trip.trip_name}
                    </span>
                  </div>
                </div>
              </AdvancedMarker>
            );
          })}

          {/* Info Window for selected destination */}
          {selectedDest && (
            <InfoWindow
              position={{ lat: selectedLat + 0.3, lng: selectedLng }}
              onCloseClick={() => {
                setSelectedDest(null);
                setAffiliateLinks([]);
              }}
            >
              <div style={{ maxWidth: 320, padding: 4 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 900,
                      margin: 0,
                      color: "#111827",
                    }}
                  >
                    {selectedName}
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: "#6B7280",
                    margin: "0 0 8px 0",
                  }}
                >
                  📍 {selectedCountry}
                </p>

                {selectedDest.tip_count && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    {selectedDest.recommend_count > 0 && (
                      <span
                        style={{
                          background: "#D1FAE5",
                          color: "#065F46",
                          padding: "2px 8px",
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        👍 {selectedDest.recommend_count}
                      </span>
                    )}
                    {selectedDest.avoid_count > 0 && (
                      <span
                        style={{
                          background: "#FEE2E2",
                          color: "#991B1B",
                          padding: "2px 8px",
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        👎 {selectedDest.avoid_count}
                      </span>
                    )}
                    {selectedDest.warning_count > 0 && (
                      <span
                        style={{
                          background: "#FEF3C7",
                          color: "#92400E",
                          padding: "2px 8px",
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        ⚠️ {selectedDest.warning_count}
                      </span>
                    )}
                  </div>
                )}

                {/* Affiliate booking links */}
                {affiliateLinks.length > 0 && (
                  <div
                    style={{
                      borderTop: "1px solid #E5E7EB",
                      paddingTop: 8,
                      marginTop: 4,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: "#008C8F",
                        marginBottom: 6,
                      }}
                    >
                      ✨ Book Your Trip
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {Object.entries(groupedLinks)
                        .slice(0, 4)
                        .map(([cat, links]) =>
                          links.slice(0, 1).map((link) => (
                            <a
                              key={link.id}
                              href={link.booking_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 3,
                                background: "#F3F4F6",
                                padding: "4px 8px",
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 600,
                                color: "#374151",
                                textDecoration: "none",
                              }}
                            >
                              {link.partner_name} ↗
                            </a>
                          )),
                        )}
                    </div>
                  </div>
                )}

                <a
                  href={`/destination/${selectedDest.id || ""}`}
                  style={{
                    display: "block",
                    textAlign: "center",
                    background: "linear-gradient(to right, #008C8F, #7DE2D1)",
                    color: "white",
                    padding: "8px 16px",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: "none",
                    marginTop: 10,
                  }}
                >
                  View Destination →
                </a>
              </div>
            </InfoWindow>
          )}

          {/* Info Window for selected trip */}
          {selectedTrip && (
            <InfoWindow
              position={{ lat: selectedTripLat + 0.1, lng: selectedTripLng }}
              onCloseClick={() => setSelectedTrip(null)}
            >
              <div style={{ maxWidth: 300, padding: 4 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <Plane className="w-4 h-4 text-[#008C8F]" />
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 900,
                      margin: 0,
                      color: "#111827",
                    }}
                  >
                    {selectedTrip.trip_name}
                  </h3>
                </div>

                <p
                  style={{
                    fontSize: 12,
                    color: "#6B7280",
                    margin: "0 0 8px 0",
                  }}
                >
                  📍 {selectedTrip.destination_name},{" "}
                  {selectedTrip.destination_country}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span style={{ fontSize: 11, color: "#6B7280" }}>
                    {new Date(selectedTrip.start_date).toLocaleDateString()}
                    {selectedTrip.end_date &&
                      ` - ${new Date(selectedTrip.end_date).toLocaleDateString()}`}
                  </span>
                </div>

                {selectedTrip.status && (
                  <span
                    style={{
                      display: "inline-block",
                      background:
                        selectedTrip.status === "completed"
                          ? "#D1FAE5"
                          : selectedTrip.status === "planned"
                            ? "#DBEAFE"
                            : "#F3F4F6",
                      color:
                        selectedTrip.status === "completed"
                          ? "#065F46"
                          : selectedTrip.status === "planned"
                            ? "#1E40AF"
                            : "#374151",
                      padding: "2px 8px",
                      borderRadius: 8,
                      fontSize: 10,
                      fontWeight: 700,
                      marginBottom: 8,
                    }}
                  >
                    {selectedTrip.status === "completed"
                      ? "✓ Completed"
                      : selectedTrip.status === "planned"
                        ? "→ Planned"
                        : selectedTrip.status}
                  </span>
                )}

                {selectedTrip.share_description && (
                  <p
                    style={{
                      fontSize: 11,
                      color: "#4B5563",
                      margin: "8px 0",
                      fontStyle: "italic",
                    }}
                  >
                    "{selectedTrip.share_description}"
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: "1px solid #E5E7EB",
                  }}
                >
                  {selectedTrip.profile_image && (
                    <img
                      src={selectedTrip.profile_image}
                      alt={selectedTrip.username}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                  <span
                    style={{ fontSize: 10, color: "#6B7280", fontWeight: 600 }}
                  >
                    by @{selectedTrip.username}
                    {selectedTrip.is_verified && (
                      <span style={{ color: "#10B981", marginLeft: 2 }}>✓</span>
                    )}
                  </span>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      {/* Trip Creation Modal */}
      {newTripData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-[#008C8F]" />
                <h2 className="text-xl font-black text-gray-900">
                  Pin Your Trip
                </h2>
              </div>
              <button
                onClick={() => setNewTripData(null)}
                className="p-2 hover:bg-gray-100 rounded-xl"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <p className="text-gray-600 text-sm mb-4">
              Creating a trip to{" "}
              <strong>
                {newTripData.destination_name}, {newTripData.country}
              </strong>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Trip Name
                </label>
                <input
                  type="text"
                  value={tripForm.trip_name}
                  onChange={(e) =>
                    setTripForm({ ...tripForm, trip_name: e.target.value })
                  }
                  placeholder="e.g., Tokyo Adventure 2024"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#008C8F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={tripForm.start_date}
                    onChange={(e) =>
                      setTripForm({ ...tripForm, start_date: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#008C8F]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={tripForm.end_date}
                    onChange={(e) =>
                      setTripForm({ ...tripForm, end_date: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#008C8F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Notes (Optional)
                </label>
                <textarea
                  value={tripForm.notes}
                  onChange={(e) =>
                    setTripForm({ ...tripForm, notes: e.target.value })
                  }
                  placeholder="What are you planning for this trip?"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#008C8F] resize-none"
                  rows={3}
                />
              </div>
            </div>

            <button
              onClick={handleSubmitTrip}
              disabled={
                !tripForm.trip_name ||
                !tripForm.start_date ||
                createTripMutation.isPending
              }
              className="w-full bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] text-white py-3.5 rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 mt-6"
            >
              {createTripMutation.isPending
                ? "Creating Trip..."
                : "Create Trip ✈️"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
