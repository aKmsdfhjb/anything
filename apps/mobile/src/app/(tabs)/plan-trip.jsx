import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useState, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Plane,
  X,
  Plus,
  ChevronDown,
  Search,
  Check,
} from "lucide-react-native";

// ─── Planning sections config ──────────────────────────────────────────────────
const PLANNING_SECTIONS = [
  {
    key: "flights",
    emoji: "✈️",
    title: "Flights",
    subtitle: "Departure & return flights",
    color: "#3B82F6",
    bg: "#EFF6FF",
    fields: [
      {
        key: "departure_airport",
        label: "Departure Airport",
        placeholder: "e.g. Manchester (MAN)",
      },
      {
        key: "arrival_airport",
        label: "Arrival Airport",
        placeholder: "e.g. Rhodes (RHO)",
      },
      {
        key: "outbound_flight",
        label: "Outbound Flight",
        placeholder: "e.g. TOM123 — 06:00 dep",
      },
      {
        key: "return_flight",
        label: "Return Flight",
        placeholder: "e.g. TOM124 — 14:30 dep",
      },
      {
        key: "airline",
        label: "Airline",
        placeholder: "e.g. TUI, easyJet, Ryanair",
      },
      {
        key: "flight_reference",
        label: "Booking Reference",
        placeholder: "e.g. ABC123",
      },
    ],
  },
  {
    key: "hotel",
    emoji: "🏨",
    title: "Hotel",
    subtitle: "Accommodation details",
    color: "#10B981",
    bg: "#ECFDF5",
    fields: [
      {
        key: "hotel_name",
        label: "Hotel Name",
        placeholder: "e.g. Lindos Bay Resort",
      },
      {
        key: "hotel_address",
        label: "Address",
        placeholder: "e.g. Lindos, Rhodes, Greece",
      },
      {
        key: "hotel_checkin",
        label: "Check-in Date",
        placeholder: "e.g. 12 Jul 2026",
      },
      {
        key: "hotel_checkout",
        label: "Check-out Date",
        placeholder: "e.g. 19 Jul 2026",
      },
      {
        key: "hotel_ref",
        label: "Booking Reference",
        placeholder: "e.g. BK987654",
      },
      {
        key: "hotel_board",
        label: "Board Basis",
        placeholder: "e.g. All Inclusive, B&B",
      },
    ],
  },
  {
    key: "transport",
    emoji: "🚕",
    title: "Transport",
    subtitle: "Transfers, car hire & more",
    color: "#8B5CF6",
    bg: "#F5F3FF",
    fields: [
      {
        key: "transfer_type",
        label: "Transfer Type",
        placeholder: "e.g. Airport transfer, Car hire",
      },
      {
        key: "transfer_company",
        label: "Company",
        placeholder: "e.g. Hertz, TUI Transfers",
      },
      {
        key: "transfer_ref",
        label: "Booking Reference",
        placeholder: "e.g. HR123456",
      },
      {
        key: "transfer_notes",
        label: "Notes",
        placeholder: "e.g. Meet at arrivals gate 3",
      },
    ],
  },
  {
    key: "activities",
    emoji: "🎟️",
    title: "Activities",
    subtitle: "Excursions, tours & restaurants",
    color: "#F59E0B",
    bg: "#FFFBEB",
    type: "list",
  },
  {
    key: "documents",
    emoji: "📄",
    title: "Documents",
    subtitle: "Upload confirmations & tickets",
    color: "#64748B",
    bg: "#F1F5F9",
    type: "info",
    info: "After creating the trip, open it to upload PDFs and photos of your booking confirmations, tickets and travel insurance.",
  },
  {
    key: "travellers",
    emoji: "👥",
    title: "Travel Party",
    subtitle: "Invite friends or family",
    color: "#EC4899",
    bg: "#FDF2F8",
    type: "info",
    info: "Once the trip is created, open it to invite your travel companions to collaborate on the itinerary.",
  },
];

// ─── Section Card ──────────────────────────────────────────────────────────────
function SectionCard({
  section,
  data,
  onChange,
  activities,
  onActivityChange,
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 20,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        overflow: "hidden",
      }}
    >
      <TouchableOpacity
        onPress={() => setExpanded((e) => !e)}
        activeOpacity={0.85}
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          gap: 12,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 13,
            backgroundColor: section.bg,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 22 }}>{section.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#0F172A", fontSize: 15, fontWeight: "800" }}>
            {section.title}
          </Text>
          <Text style={{ color: "#94A3B8", fontSize: 12, marginTop: 1 }}>
            {section.subtitle}
          </Text>
        </View>
        <View style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }}>
          <ChevronDown size={20} color="#CBD5E1" />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 16,
            borderTopWidth: 1,
            borderTopColor: "#F1F5F9",
          }}
        >
          {section.fields?.map((field) => (
            <View key={field.key} style={{ marginTop: 12 }}>
              <Text
                style={{
                  color: "#475569",
                  fontSize: 12,
                  fontWeight: "700",
                  marginBottom: 5,
                }}
              >
                {field.label}
              </Text>
              <TextInput
                value={data?.[field.key] || ""}
                onChangeText={(v) => onChange(field.key, v)}
                placeholder={field.placeholder}
                placeholderTextColor="#CBD5E1"
                style={{
                  backgroundColor: "#F8FAFC",
                  borderWidth: 1.5,
                  borderColor: "#E2E8F0",
                  borderRadius: 12,
                  padding: 13,
                  fontSize: 14,
                  color: "#0F172A",
                }}
              />
            </View>
          ))}
          {section.type === "list" && (
            <View style={{ marginTop: 12 }}>
              {activities.map((act, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <TextInput
                    value={act}
                    onChangeText={(v) => onActivityChange(i, v)}
                    placeholder={`Activity ${i + 1} — e.g. Boat trip, Dinner at Mario's`}
                    placeholderTextColor="#CBD5E1"
                    style={{
                      flex: 1,
                      backgroundColor: "#F8FAFC",
                      borderWidth: 1.5,
                      borderColor: "#E2E8F0",
                      borderRadius: 12,
                      padding: 13,
                      fontSize: 14,
                      color: "#0F172A",
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => onActivityChange(i, null)}
                    style={{ padding: 6 }}
                  >
                    <X size={15} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                onPress={() => onActivityChange(activities.length, "")}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 4,
                  paddingVertical: 8,
                }}
              >
                <Plus size={15} color="#008C8F" />
                <Text
                  style={{ color: "#008C8F", fontWeight: "700", fontSize: 14 }}
                >
                  Add Activity
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {section.type === "info" && (
            <View
              style={{
                marginTop: 12,
                backgroundColor: section.bg,
                borderRadius: 12,
                padding: 14,
              }}
            >
              <Text style={{ color: "#475569", fontSize: 13, lineHeight: 20 }}>
                {section.info}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Destination Search Modal ──────────────────────────────────────────────────
function DestinationModal({ visible, onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = { current: null };

  const search = useCallback((text) => {
    setQuery(text);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (text.length < 2) {
      setResults([]);
      return;
    }
    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/places-search?input=${encodeURIComponent(text)}`,
        );
        if (res.ok) {
          const d = await res.json();
          setResults(d.predictions || []);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }, 350);
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      presentationStyle="pageSheet"
    >
      <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
        <View
          style={{
            backgroundColor: "#fff",
            paddingTop: 56,
            paddingBottom: 16,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: "#E2E8F0",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <TouchableOpacity onPress={onClose}>
              <X size={22} color="#64748B" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "900", color: "#0F172A" }}>
              Where are you going?
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#F1F5F9",
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 12,
              marginTop: 16,
              gap: 10,
            }}
          >
            <Search size={18} color="#94A3B8" />
            <TextInput
              value={query}
              onChangeText={search}
              placeholder="City, country or resort…"
              placeholderTextColor="#94A3B8"
              autoFocus
              style={{
                flex: 1,
                fontSize: 15,
                color: "#0F172A",
                fontWeight: "500",
              }}
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setQuery("");
                  setResults([]);
                }}
              >
                <X size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {loading && (
            <ActivityIndicator color="#008C8F" style={{ marginVertical: 24 }} />
          )}
          {results.map((r) => (
            <TouchableOpacity
              key={r.place_id}
              onPress={() => {
                onSelect({
                  name: r.main_text,
                  fullName: r.description,
                  place_id: r.place_id,
                });
                onClose();
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 16,
                marginBottom: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: "#F0FDFA",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MapPin size={18} color="#008C8F" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ color: "#0F172A", fontWeight: "700", fontSize: 15 }}
                  numberOfLines={1}
                >
                  {r.main_text}
                </Text>
                <Text
                  style={{ color: "#94A3B8", fontSize: 12 }}
                  numberOfLines={1}
                >
                  {r.secondary_text}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          {!loading && query.length > 1 && results.length === 0 && (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <Text style={{ fontSize: 32, marginBottom: 12 }}>🌍</Text>
              <Text style={{ color: "#94A3B8", fontSize: 15 }}>
                No results for "{query}"
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Build notes from section data ────────────────────────────────────────────
function buildNotes(sectionData, activities, travellers) {
  const lines = [];
  if (travellers && travellers !== "1")
    lines.push(`👥 ${travellers} travellers`);
  else if (travellers === "1") lines.push(`👤 1 traveller`);

  const fl = sectionData.flights || {};
  if (Object.values(fl).some(Boolean)) {
    lines.push("\n✈️ FLIGHTS");
    if (fl.departure_airport) lines.push(`From: ${fl.departure_airport}`);
    if (fl.arrival_airport) lines.push(`To: ${fl.arrival_airport}`);
    if (fl.outbound_flight) lines.push(`Out: ${fl.outbound_flight}`);
    if (fl.return_flight) lines.push(`Ret: ${fl.return_flight}`);
    if (fl.flight_reference) lines.push(`Ref: ${fl.flight_reference}`);
  }

  const ho = sectionData.hotel || {};
  if (Object.values(ho).some(Boolean)) {
    lines.push("\n🏨 HOTEL");
    if (ho.hotel_name) lines.push(ho.hotel_name);
    if (ho.hotel_address) lines.push(ho.hotel_address);
    if (ho.hotel_checkin) lines.push(`Check-in: ${ho.hotel_checkin}`);
    if (ho.hotel_checkout) lines.push(`Check-out: ${ho.hotel_checkout}`);
    if (ho.hotel_board) lines.push(`Board: ${ho.hotel_board}`);
    if (ho.hotel_ref) lines.push(`Ref: ${ho.hotel_ref}`);
  }

  const tr = sectionData.transport || {};
  if (Object.values(tr).some(Boolean)) {
    lines.push("\n🚕 TRANSPORT");
    if (tr.transfer_type) lines.push(tr.transfer_type);
    if (tr.transfer_company) lines.push(tr.transfer_company);
    if (tr.transfer_ref) lines.push(`Ref: ${tr.transfer_ref}`);
    if (tr.transfer_notes) lines.push(tr.transfer_notes);
  }

  const acts = activities.filter((a) => a.trim());
  if (acts.length > 0) {
    lines.push("\n🎟️ ACTIVITIES");
    acts.forEach((a) => lines.push(`· ${a}`));
  }

  return lines.join("\n") || null;
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function PlanTripScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [destination, setDestination] = useState(null);
  const [tripName, setTripName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travellersCount, setTravellersCount] = useState("2");
  const [sectionData, setSectionData] = useState({});
  const [activities, setActivities] = useState([""]);
  const [showDestModal, setShowDestModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const updateSection = (sKey, fKey, value) => {
    setSectionData((p) => ({
      ...p,
      [sKey]: { ...(p[sKey] || {}), [fKey]: value },
    }));
  };

  const updateActivity = (index, value) => {
    setActivities((prev) => {
      const next = [...prev];
      if (value === null) next.splice(index, 1);
      else if (index >= next.length) next.push(value);
      else next[index] = value;
      return next;
    });
  };

  const handleSave = async () => {
    const customDest =
      destination?.fullName ||
      destination?.name ||
      tripName.trim() ||
      "Custom Destination";
    if (!startDate.trim()) {
      Alert.alert("Required", "Please enter your departure date.");
      return;
    }

    setSaving(true);
    try {
      const descParts = [];
      if (travellersCount) descParts.push(`${travellersCount} travellers`);
      if (activities.filter((a) => a.trim()).length > 0)
        descParts.push(
          `${activities.filter((a) => a.trim()).length} activities planned`,
        );
      if (sectionData.hotel?.hotel_name)
        descParts.push(`Staying at ${sectionData.hotel.hotel_name}`);

      const body = {
        trip_name:
          tripName.trim() ||
          (destination?.name ? `${destination.name} Trip` : "My Trip"),
        custom_destination: customDest,
        start_date: startDate,
        end_date: endDate || null,
        description: descParts.join(" · ") || null,
        notes: buildNotes(sectionData, activities, travellersCount),
        status: "planned",
      };

      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Could not create trip");
      }

      const data = await res.json();
      const tripId = data.trip?.id;

      Alert.alert(
        "Trip Created! 🎉",
        "Your trip has been saved. Open it to add documents and invite your travel party.",
        [
          {
            text: "Open Trip",
            onPress: () =>
              tripId
                ? router.replace(`/(tabs)/trip-details/${tripId}`)
                : router.back(),
          },
          { text: "Back to Trips", onPress: () => router.back() },
        ],
      );
    } catch (err) {
      Alert.alert("Error", err.message || "Could not save trip");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          backgroundColor: "#fff",
          paddingTop: insets.top + 12,
          paddingBottom: 16,
          paddingHorizontal: 20,
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          borderBottomWidth: 0.5,
          borderBottomColor: "rgba(0,0,0,0.08)",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            backgroundColor: "#F1F5F9",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ArrowLeft size={20} color="#374151" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#0F172A", fontSize: 20, fontWeight: "900" }}>
            Plan Your Holiday
          </Text>
          <Text style={{ color: "#94A3B8", fontSize: 12, marginTop: 1 }}>
            Fill in your trip details below
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            padding: 20,
            paddingBottom: insets.bottom + 120,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── DESTINATION ────────────────────────────────────────────── */}
          <Text
            style={{
              color: "#0F172A",
              fontSize: 18,
              fontWeight: "900",
              marginBottom: 14,
            }}
          >
            Where are you going?
          </Text>

          {/* Destination picker */}
          <TouchableOpacity
            onPress={() => setShowDestModal(true)}
            style={{
              backgroundColor: "#fff",
              borderWidth: 2,
              borderColor: destination ? "#008C8F" : "#E2E8F0",
              borderRadius: 18,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginBottom: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 13,
                backgroundColor: "#F0FDFA",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MapPin size={20} color="#008C8F" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "#94A3B8",
                  fontSize: 10,
                  fontWeight: "800",
                  marginBottom: 2,
                  letterSpacing: 0.5,
                }}
              >
                DESTINATION
              </Text>
              <Text
                style={{
                  color: destination ? "#0F172A" : "#CBD5E1",
                  fontSize: 15,
                  fontWeight: destination ? "700" : "500",
                }}
              >
                {destination?.name || "Tap to search…"}
              </Text>
              {destination?.fullName &&
                destination.fullName !== destination.name && (
                  <Text
                    style={{ color: "#94A3B8", fontSize: 12, marginTop: 2 }}
                    numberOfLines={1}
                  >
                    {destination.fullName}
                  </Text>
                )}
            </View>
            <Search size={18} color="#CBD5E1" />
          </TouchableOpacity>

          {/* Trip name */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
              borderWidth: 1.5,
              borderColor: "#E2E8F0",
            }}
          >
            <Text
              style={{
                color: "#94A3B8",
                fontSize: 10,
                fontWeight: "800",
                marginBottom: 4,
                letterSpacing: 0.5,
              }}
            >
              TRIP NAME (OPTIONAL)
            </Text>
            <TextInput
              value={tripName}
              onChangeText={setTripName}
              placeholder={
                destination?.name
                  ? `${destination.name} Holiday 2026`
                  : "e.g. Summer Holiday 2026"
              }
              placeholderTextColor="#CBD5E1"
              style={{ fontSize: 15, color: "#0F172A", fontWeight: "600" }}
            />
          </View>

          {/* Dates */}
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 16,
                borderWidth: 1.5,
                borderColor: "#E2E8F0",
              }}
            >
              <Text
                style={{
                  color: "#94A3B8",
                  fontSize: 9,
                  fontWeight: "800",
                  marginBottom: 4,
                  letterSpacing: 0.5,
                }}
              >
                DEPARTURE *
              </Text>
              <TextInput
                value={startDate}
                onChangeText={setStartDate}
                placeholder="12 Jul 2026"
                placeholderTextColor="#CBD5E1"
                style={{ fontSize: 14, color: "#0F172A", fontWeight: "700" }}
              />
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 16,
                borderWidth: 1.5,
                borderColor: "#E2E8F0",
              }}
            >
              <Text
                style={{
                  color: "#94A3B8",
                  fontSize: 9,
                  fontWeight: "800",
                  marginBottom: 4,
                  letterSpacing: 0.5,
                }}
              >
                RETURN
              </Text>
              <TextInput
                value={endDate}
                onChangeText={setEndDate}
                placeholder="19 Jul 2026"
                placeholderTextColor="#CBD5E1"
                style={{ fontSize: 14, color: "#0F172A", fontWeight: "700" }}
              />
            </View>
          </View>

          {/* Travellers */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 16,
              marginBottom: 24,
              borderWidth: 1.5,
              borderColor: "#E2E8F0",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 13,
                backgroundColor: "#F5F3FF",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}
            >
              <Users size={20} color="#8B5CF6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "#94A3B8",
                  fontSize: 10,
                  fontWeight: "800",
                  marginBottom: 4,
                  letterSpacing: 0.5,
                }}
              >
                TRAVELLERS
              </Text>
              <Text
                style={{ fontSize: 16, color: "#0F172A", fontWeight: "800" }}
              >
                {travellersCount}{" "}
                {parseInt(travellersCount) === 1 ? "person" : "people"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                onPress={() =>
                  setTravellersCount((v) =>
                    Math.max(1, parseInt(v || 1) - 1).toString(),
                  )
                }
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  backgroundColor: "#F1F5F9",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    color: "#374151",
                    fontWeight: "900",
                    lineHeight: 22,
                  }}
                >
                  −
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  setTravellersCount((v) => (parseInt(v || 1) + 1).toString())
                }
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  backgroundColor: "#F0FDFA",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    color: "#008C8F",
                    fontWeight: "900",
                    lineHeight: 22,
                  }}
                >
                  +
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Divider */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
              gap: 12,
            }}
          >
            <View style={{ flex: 1, height: 1, backgroundColor: "#E2E8F0" }} />
            <Text
              style={{
                color: "#94A3B8",
                fontWeight: "800",
                fontSize: 11,
                letterSpacing: 0.5,
              }}
            >
              TRIP DETAILS
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: "#E2E8F0" }} />
          </View>

          <Text
            style={{
              color: "#94A3B8",
              fontSize: 13,
              marginBottom: 16,
              lineHeight: 20,
            }}
          >
            Tap a section to expand and add your details. You can fill these in
            now or after creating the trip.
          </Text>

          {/* Planning section cards */}
          {PLANNING_SECTIONS.map((section) => (
            <SectionCard
              key={section.key}
              section={section}
              data={sectionData[section.key] || {}}
              onChange={(fKey, value) =>
                updateSection(section.key, fKey, value)
              }
              activities={activities}
              onActivityChange={
                section.key === "activities" ? updateActivity : undefined
              }
            />
          ))}

          {/* Create button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={{
              backgroundColor: "#008C8F",
              borderRadius: 20,
              paddingVertical: 18,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 10,
              marginTop: 12,
              shadowColor: "#008C8F",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.28,
              shadowRadius: 14,
              elevation: 8,
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Check size={22} color="#fff" strokeWidth={2.5} />
                <Text
                  style={{ color: "#fff", fontWeight: "900", fontSize: 18 }}
                >
                  Create Trip
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <DestinationModal
        visible={showDestModal}
        onClose={() => setShowDestModal(false)}
        onSelect={(dest) => {
          setDestination(dest);
          setShowDestModal(false);
        }}
      />
    </View>
  );
}
