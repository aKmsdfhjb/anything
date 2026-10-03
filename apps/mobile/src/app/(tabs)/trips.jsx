import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  RefreshControl,
} from "react-native";
import { useState, useRef, useCallback, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import {
  Plus,
  MapPin,
  Calendar,
  ChevronRight,
  Briefcase,
  Trash2,
  Users,
  Clock,
  Plane,
} from "lucide-react-native";
import useUser from "@/utils/auth/useUser";
import { useAuth } from "@/utils/auth/useAuth";
import { calculateCountdown } from "@/utils/tripHelpers";

// ─── Helpers ───────────────────────────────────────────────────────────────────
function fmt(
  dateStr,
  opts = { day: "numeric", month: "short", year: "numeric" },
) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", opts);
}

function statusColor(status) {
  switch (status) {
    case "upcoming":
      return "#008C8F";
    case "planned":
      return "#3B82F6";
    case "completed":
      return "#64748B";
    case "cancelled":
      return "#EF4444";
    default:
      return "#6B7280";
  }
}

function tripIsUpcoming(trip) {
  return (
    ["planned", "upcoming"].includes(trip.status) &&
    new Date(trip.start_date) >= new Date(Date.now() - 86400000)
  );
}
function tripIsPast(trip) {
  return (
    trip.status === "completed" ||
    new Date(trip.start_date) < new Date(Date.now() - 86400000)
  );
}

// ─── Trip Card ─────────────────────────────────────────────────────────────────
function TripCard({ trip, onPress, onDelete }) {
  const countdown = calculateCountdown(trip.start_date);
  const isShared = trip.is_collaborator;
  const dest =
    trip.destination_name || trip.custom_destination || "Unknown destination";
  const country = trip.country ? `, ${trip.country}` : "";
  const isSoon =
    countdown.days <= 7 && countdown.days > 0 && countdown.isUpcoming;
  const isToday = countdown.days === 0 && countdown.isUpcoming;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.92}
      style={{
        backgroundColor: "#fff",
        borderRadius: 20,
        marginBottom: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
      }}
    >
      {/* Cover image or teal gradient header */}
      {trip.cover_image ? (
        <Image
          source={{ uri: trip.cover_image }}
          style={{ width: "100%", height: 140 }}
          contentFit="cover"
        />
      ) : (
        <View
          style={{
            height: 90,
            backgroundColor: isToday
              ? "#EF4444"
              : isSoon
                ? "#F59E0B"
                : "#008C8F",
            justifyContent: "flex-end",
            paddingHorizontal: 20,
            paddingBottom: 14,
          }}
        >
          <Text
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 42,
              fontWeight: "900",
              position: "absolute",
              right: 16,
              top: 8,
            }}
          >
            ✈️
          </Text>
          {isToday && (
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                alignSelf: "flex-start",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "900", fontSize: 11 }}>
                🎉 TODAY
              </Text>
            </View>
          )}
          {isSoon && !isToday && (
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                alignSelf: "flex-start",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "900", fontSize: 11 }}>
                🔥 SOON
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Content */}
      <View style={{ padding: 18 }}>
        {/* Shared badge */}
        {isShared && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#F0F9FF",
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 20,
              alignSelf: "flex-start",
              marginBottom: 10,
              gap: 5,
            }}
          >
            <Users size={12} color="#0284C7" />
            <Text style={{ color: "#0284C7", fontSize: 11, fontWeight: "700" }}>
              Shared by {trip.owner_username || "a friend"}
            </Text>
          </View>
        )}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text
              style={{
                color: "#0F172A",
                fontSize: 18,
                fontWeight: "900",
                marginBottom: 6,
              }}
              numberOfLines={1}
            >
              {trip.trip_name}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                marginBottom: 5,
              }}
            >
              <MapPin size={13} color="#008C8F" />
              <Text
                style={{ color: "#374151", fontSize: 13, fontWeight: "600" }}
                numberOfLines={1}
              >
                {dest}
                {country}
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
            >
              <Calendar size={13} color="#94A3B8" />
              <Text
                style={{ color: "#94A3B8", fontSize: 12, fontWeight: "600" }}
              >
                {fmt(trip.start_date, { day: "numeric", month: "short" })}
                {trip.end_date
                  ? ` – ${fmt(trip.end_date, { day: "numeric", month: "short", year: "numeric" })}`
                  : ""}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={{ flexDirection: "row", gap: 8 }}>
            {!isShared && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onDelete(trip.id);
                }}
                style={{
                  padding: 8,
                  borderRadius: 10,
                  backgroundColor: "#FFF1F2",
                }}
              >
                <Trash2 size={16} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Countdown or status */}
        {countdown.isUpcoming && (
          <View
            style={{
              marginTop: 12,
              backgroundColor:
                countdown.days === 0
                  ? "#FEF2F2"
                  : countdown.days <= 7
                    ? "#FFFBEB"
                    : "#F0FDFA",
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Clock
              size={15}
              color={
                countdown.days === 0
                  ? "#EF4444"
                  : countdown.days <= 7
                    ? "#F59E0B"
                    : "#008C8F"
              }
            />
            <Text
              style={{
                fontWeight: "800",
                fontSize: 13,
                color:
                  countdown.days === 0
                    ? "#EF4444"
                    : countdown.days <= 7
                      ? "#F59E0B"
                      : "#008C8F",
              }}
            >
              {countdown.text}
            </Text>
          </View>
        )}

        {/* View button */}
        <TouchableOpacity
          onPress={onPress}
          style={{
            marginTop: 14,
            backgroundColor: "#F0FDFA",
            borderRadius: 12,
            paddingVertical: 11,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Text style={{ color: "#008C8F", fontWeight: "800", fontSize: 14 }}>
            {isShared ? "View Shared Trip" : "Open Trip Planner"}
          </Text>
          <ChevronRight size={16} color="#008C8F" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ tab, onPlan }) {
  const msgs = {
    upcoming: {
      emoji: "✈️",
      title: "No upcoming trips",
      body: "Start planning your next adventure!",
      cta: true,
    },
    past: {
      emoji: "🗺️",
      title: "No past trips yet",
      body: "Your completed trips will appear here.",
    },
    saved: {
      emoji: "🔖",
      title: "No saved trips",
      body: "Trips shared with you by friends will appear here.",
    },
  };
  const m = msgs[tab] || msgs.upcoming;
  return (
    <View
      style={{
        alignItems: "center",
        paddingVertical: 60,
        paddingHorizontal: 30,
      }}
    >
      <Text style={{ fontSize: 56, marginBottom: 16 }}>{m.emoji}</Text>
      <Text
        style={{
          color: "#0F172A",
          fontSize: 20,
          fontWeight: "900",
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        {m.title}
      </Text>
      <Text
        style={{
          color: "#94A3B8",
          fontSize: 15,
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        {m.body}
      </Text>
      {m.cta && (
        <TouchableOpacity
          onPress={onPlan}
          style={{
            backgroundColor: "#008C8F",
            borderRadius: 16,
            paddingHorizontal: 28,
            paddingVertical: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Plus size={18} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>
            Plan a Trip
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function TripsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: user } = useUser();
  const { signIn } = useAuth();

  const [activeTab, setActiveTab] = useState("upcoming");
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const TABS = [
    { key: "upcoming", label: "Upcoming" },
    { key: "past", label: "Past" },
    { key: "saved", label: "Shared" },
  ];

  const loadTrips = useCallback(async () => {
    try {
      const res = await fetch("/api/trips");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setTrips(data.trips || []);
    } catch (err) {
      console.error("loadTrips:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadTrips();
    else setLoading(false);
  }, [user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTrips();
  }, [loadTrips]);

  const deleteTrip = async (tripId) => {
    Alert.alert("Delete Trip", "Are you sure you want to delete this trip?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await fetch(`/api/trips/${tripId}`, { method: "DELETE" });
            setTrips((prev) => prev.filter((t) => t.id !== tripId));
          } catch {
            Alert.alert("Error", "Could not delete trip");
          }
        },
      },
    ]);
  };

  const filteredTrips = trips.filter((t) => {
    if (activeTab === "upcoming")
      return !t.is_collaborator && tripIsUpcoming(t);
    if (activeTab === "past") return !t.is_collaborator && tripIsPast(t);
    if (activeTab === "saved") return t.is_collaborator;
    return true;
  });

  const handlePlanTrip = () => router.push("/(tabs)/plan-trip");
  const handleTripPress = (id) => router.push(`/(tabs)/trip-details/${id}`);

  // ── Unauthenticated ──────────────────────────────────────────────────────────
  if (!loading && !user) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F8FAFC",
          justifyContent: "center",
          alignItems: "center",
          padding: 32,
        }}
      >
        <StatusBar style="dark" />
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
          <Briefcase size={36} color="#008C8F" />
        </View>
        <Text
          style={{
            color: "#0F172A",
            fontSize: 22,
            fontWeight: "900",
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          My Trips
        </Text>
        <Text
          style={{
            color: "#94A3B8",
            fontSize: 15,
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          Sign in to plan holidays, save trips and invite friends.
        </Text>
        <TouchableOpacity
          onPress={() => signIn()}
          style={{
            backgroundColor: "#008C8F",
            borderRadius: 16,
            paddingHorizontal: 36,
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
            Sign In
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <StatusBar style="dark" />

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <View
        style={{
          backgroundColor: "#fff",
          paddingTop: insets.top + 12,
          paddingBottom: 0,
          paddingHorizontal: 20,
          borderBottomWidth: 0.5,
          borderBottomColor: "rgba(0,0,0,0.08)",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <View>
            <Text
              style={{
                color: "#0F172A",
                fontSize: 26,
                fontWeight: "900",
                letterSpacing: -0.5,
              }}
            >
              My Trips
            </Text>
            <Text
              style={{
                color: "#94A3B8",
                fontSize: 13,
                fontWeight: "600",
                marginTop: 1,
              }}
            >
              {
                trips.filter((t) => !t.is_collaborator && tripIsUpcoming(t))
                  .length
              }{" "}
              upcoming
            </Text>
          </View>
          <TouchableOpacity
            onPress={handlePlanTrip}
            style={{
              backgroundColor: "#008C8F",
              borderRadius: 16,
              paddingHorizontal: 18,
              paddingVertical: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 7,
            }}
          >
            <Plus size={17} color="#fff" strokeWidth={2.5} />
            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 14 }}>
              New Trip
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab pills */}
        <View style={{ flexDirection: "row", gap: 4, paddingBottom: 1 }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: active ? "#008C8F" : "transparent",
                  marginBottom: active ? 0 : 0,
                }}
              >
                <Text
                  style={{
                    color: active ? "#fff" : "#9CA3AF",
                    fontWeight: "800",
                    fontSize: 14,
                  }}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Active tab underline indicator */}
        <View style={{ height: 3 }} />
      </View>

      {/* ── PLAN A NEW TRIP BANNER ─────────────────────────────────────────── */}
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 4 }}>
        <TouchableOpacity
          onPress={handlePlanTrip}
          activeOpacity={0.9}
          style={{
            backgroundColor: "#008C8F",
            borderRadius: 20,
            padding: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            shadowColor: "#008C8F",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 14,
            elevation: 8,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "900",
                marginBottom: 4,
              }}
            >
              + Plan a New Trip
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>
              Flights, hotels, activities & more
            </Text>
          </View>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: "rgba(255,255,255,0.2)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Plane size={26} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      {/* ── TRIPS LIST ─────────────────────────────────────────────────────── */}
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#008C8F" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: insets.bottom + 100,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#008C8F"
            />
          }
        >
          {filteredTrips.length === 0 ? (
            <EmptyState tab={activeTab} onPlan={handlePlanTrip} />
          ) : (
            filteredTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onPress={() => handleTripPress(trip.id)}
                onDelete={deleteTrip}
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}
