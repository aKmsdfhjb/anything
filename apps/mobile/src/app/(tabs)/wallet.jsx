import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import {
  Wallet,
  ShieldCheck,
  Plane,
  Hotel,
  Ticket,
  Car,
  Shield,
  FileText,
  Utensils,
  Bus,
  Lock,
  Globe,
  Plus,
  Upload,
  Trash2,
  ExternalLink,
  ChevronDown,
  Check,
  X,
  FileCheck,
  MapPin,
  Calendar,
  Ship,
} from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import useUser from "@/utils/auth/useUser";
import useUpload from "@/utils/useUpload";
import DocumentViewer from "@/components/TripDocuments/DocumentViewer";
import { useAuth } from "@/utils/auth/useAuth";

// ─── Type config ──────────────────────────────────────────
const DOC_TYPES = [
  {
    value: "flight",
    label: "Flight",
    emoji: "✈️",
    icon: Plane,
    color: "#3B82F6",
  },
  {
    value: "hotel",
    label: "Accommodation",
    emoji: "🏨",
    icon: Hotel,
    color: "#10B981",
  },
  {
    value: "excursion",
    label: "Excursion",
    emoji: "🚢",
    icon: Ship,
    color: "#F59E0B",
  },
  {
    value: "event",
    label: "Events & Tickets",
    emoji: "🎫",
    icon: Ticket,
    color: "#EC4899",
  },
  {
    value: "restaurant",
    label: "Restaurant",
    emoji: "🍽️",
    icon: Utensils,
    color: "#F97316",
  },
  {
    value: "transfer",
    label: "Transfer",
    emoji: "🚌",
    icon: Bus,
    color: "#8B5CF6",
  },
  {
    value: "car_hire",
    label: "Car Hire",
    emoji: "🚗",
    icon: Car,
    color: "#06B6D4",
  },
  {
    value: "insurance",
    label: "Travel Insurance",
    emoji: "🛡️",
    icon: Shield,
    color: "#EF4444",
  },
  {
    value: "visa",
    label: "Visa / Passport",
    emoji: "📘",
    icon: FileCheck,
    color: "#6366F1",
  },
  {
    value: "other",
    label: "Other",
    emoji: "📎",
    icon: FileText,
    color: "#64748B",
  },
];

const getDocType = (val) =>
  DOC_TYPES.find((t) => t.value === val) || DOC_TYPES[DOC_TYPES.length - 1];

const TABS = [
  { id: "mine", label: "My Documents", icon: FileText },
  { id: "shared", label: "Shared With Me", icon: Globe },
  { id: "private", label: "Private", icon: Lock },
];

// ─── Helpers ──────────────────────────────────────────────
const fmtDate = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const fmtAdded = (d) => {
  if (!d) return "";
  return (
    "Added " +
    new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  );
};

// ─── Sub-component: document card ─────────────────────────
function WalletCard({ doc, currentUserId, onView, onDelete }) {
  const dt = getDocType(doc.document_type);
  const isOwn = doc.user_id === currentUserId;

  return (
    <TouchableOpacity onPress={onView} activeOpacity={0.8}>
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 18,
          marginBottom: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.07,
          shadowRadius: 8,
          elevation: 3,
          overflow: "hidden",
        }}
      >
        {/* Coloured top strip */}
        <View style={{ height: 4, backgroundColor: dt.color }} />

        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* Icon bubble */}
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                backgroundColor: dt.color + "18",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 14,
              }}
            >
              <Text style={{ fontSize: 24 }}>{dt.emoji}</Text>
            </View>

            {/* Text */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "800",
                  color: "#0F172A",
                  marginBottom: 3,
                }}
                numberOfLines={2}
              >
                {doc.title}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  flexWrap: "wrap",
                }}
              >
                <View
                  style={{
                    backgroundColor: dt.color + "18",
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{ color: dt.color, fontSize: 11, fontWeight: "700" }}
                  >
                    {dt.label}
                  </Text>
                </View>
                {doc.is_private ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#F1F5F9",
                      borderRadius: 20,
                      paddingHorizontal: 7,
                      paddingVertical: 3,
                    }}
                  >
                    <Lock size={9} color="#64748B" />
                    <Text
                      style={{
                        color: "#64748B",
                        fontSize: 10,
                        fontWeight: "700",
                        marginLeft: 3,
                      }}
                    >
                      Private
                    </Text>
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#ECFDF5",
                      borderRadius: 20,
                      paddingHorizontal: 7,
                      paddingVertical: 3,
                    }}
                  >
                    <Globe size={9} color="#10B981" />
                    <Text
                      style={{
                        color: "#10B981",
                        fontSize: 10,
                        fontWeight: "700",
                        marginLeft: 3,
                      }}
                    >
                      Shared
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Action buttons */}
            <View style={{ gap: 8 }}>
              <TouchableOpacity
                onPress={onView}
                style={{
                  backgroundColor: dt.color + "18",
                  padding: 8,
                  borderRadius: 10,
                }}
              >
                <ExternalLink size={16} color={dt.color} />
              </TouchableOpacity>
              {isOwn && (
                <TouchableOpacity
                  onPress={onDelete}
                  style={{
                    backgroundColor: "#FEF2F2",
                    padding: 8,
                    borderRadius: 10,
                  }}
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Footer */}
          <View
            style={{
              marginTop: 12,
              paddingTop: 10,
              borderTopWidth: 1,
              borderTopColor: "#F1F5F9",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <MapPin size={11} color="#94A3B8" />
              <Text
                style={{ color: "#94A3B8", fontSize: 11, fontWeight: "600" }}
                numberOfLines={1}
              >
                {doc.trip_name || doc.trip_destination}
              </Text>
            </View>
            <Text style={{ color: "#CBD5E1", fontSize: 11 }}>
              {fmtAdded(doc.created_at)}
            </Text>
          </View>

          {doc.added_by_username && doc.user_id !== currentUserId && (
            <Text style={{ color: "#94A3B8", fontSize: 11, marginTop: 4 }}>
              Added by {doc.added_by_username}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main screen ──────────────────────────────────────────
export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { data: user } = useUser();
  const { signIn } = useAuth();
  const [upload] = useUpload();

  const [activeTab, setActiveTab] = useState("mine");
  const [documents, setDocuments] = useState([]);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null); // null = all trips
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Trip selector modal
  const [showTripPicker, setShowTripPicker] = useState(false);

  // Upload modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTripId, setUploadTripId] = useState(null);
  const [docTitle, setDocTitle] = useState("");
  const [docType, setDocType] = useState("flight");
  const [docPrivate, setDocPrivate] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Viewer
  const [viewingDoc, setViewingDoc] = useState(null);

  useEffect(() => {
    if (user) loadData();
  }, [user, activeTab, selectedTrip]);

  const loadData = async () => {
    try {
      const params = new URLSearchParams({ filter: activeTab });
      if (selectedTrip) params.append("trip_id", selectedTrip);

      const res = await fetch(`/api/wallet?${params}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setDocuments(data.documents || []);
      if (data.trips?.length && trips.length === 0) {
        setTrips(data.trips);
      }
    } catch (err) {
      console.error("Wallet load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const deleteDoc = (docId) => {
    Alert.alert(
      "Delete Document",
      "Are you sure you want to remove this document?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await fetch(`/api/trip-documents?id=${docId}`, {
                method: "DELETE",
              });
              loadData();
            } catch (err) {
              Alert.alert("Error", "Could not delete document");
            }
          },
        },
      ],
    );
  };

  const pickAndUpload = async () => {
    if (!docTitle.trim()) {
      Alert.alert("Title required", "Please enter a document title first.");
      return;
    }
    if (!uploadTripId) {
      Alert.alert(
        "Trip required",
        "Please select which trip this document belongs to.",
      );
      return;
    }
    try {
      setUploading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });
      if (result.canceled) {
        setUploading(false);
        return;
      }

      const file = result.assets[0];
      const { url, error } = await upload({
        reactNativeAsset: {
          ...file,
          uri: file.uri,
          name: file.name,
          mimeType: file.mimeType,
        },
      });

      if (error || !url) throw new Error(error || "Upload failed");

      const saveRes = await fetch("/api/trip-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trip_id: parseInt(uploadTripId),
          document_type: docType,
          title: docTitle.trim(),
          file_url: url,
          file_type: file.mimeType || "application/octet-stream",
          file_size: file.size || null,
          is_private: docPrivate,
        }),
      });
      if (!saveRes.ok) throw new Error("Save failed");

      setShowUploadModal(false);
      setDocTitle("");
      setDocType("flight");
      setDocPrivate(false);
      setUploadTripId(null);
      loadData();
    } catch (err) {
      console.error("Upload error:", err);
      Alert.alert(
        "Upload failed",
        "Could not upload your document. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  };

  const selectedTripObj = trips.find((t) => t.id === selectedTrip) || null;

  if (!user) {
    return (
      <View
        style={{ flex: 1, backgroundColor: "#F8FAFC", paddingTop: insets.top }}
      >
        <StatusBar style="dark" />
        <LinearGradient
          colors={["#008C8F", "#005F61"]}
          style={{ padding: 28, paddingTop: 32, alignItems: "center" }}
        >
          <ShieldCheck size={40} color="#fff" />
          <Text
            style={{
              color: "#fff",
              fontSize: 26,
              fontWeight: "900",
              marginTop: 12,
            }}
          >
            Travel Wallet
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: 14,
              marginTop: 4,
              textAlign: "center",
            }}
          >
            All your travel documents, securely in one place
          </Text>
        </LinearGradient>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 40,
          }}
        >
          <Lock size={56} color="#CBD5E1" />
          <Text
            style={{
              color: "#0F172A",
              fontSize: 20,
              fontWeight: "800",
              marginTop: 20,
              marginBottom: 10,
              textAlign: "center",
            }}
          >
            Sign in to access your wallet
          </Text>
          <Text
            style={{
              color: "#94A3B8",
              fontSize: 15,
              textAlign: "center",
              marginBottom: 32,
            }}
          >
            Your boarding passes, hotel bookings, tickets and travel docs are
            all stored securely here.
          </Text>
          <TouchableOpacity
            onPress={signIn}
            style={{
              backgroundColor: "#008C8F",
              paddingHorizontal: 36,
              paddingVertical: 16,
              borderRadius: 16,
              width: "100%",
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "900",
                fontSize: 17,
                textAlign: "center",
              }}
            >
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Group docs by trip
  const grouped = documents.reduce((acc, doc) => {
    const key = doc.trip_name || doc.trip_destination || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(doc);
    return acc;
  }, {});

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <StatusBar style="light" />

      {/* ─── HEADER ─── */}
      <LinearGradient
        colors={["#008C8F", "#005F61"]}
        style={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 20,
          paddingBottom: 20,
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
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                padding: 8,
                borderRadius: 12,
              }}
            >
              <Wallet size={22} color="#fff" />
            </View>
            <View>
              <Text style={{ color: "#fff", fontSize: 22, fontWeight: "900" }}>
                Travel Wallet
              </Text>
              <Text
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {documents.length} document{documents.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setShowUploadModal(true)}
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              borderWidth: 1.5,
              borderColor: "rgba(255,255,255,0.4)",
              padding: 10,
              borderRadius: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Plus size={18} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 14 }}>
              Add
            </Text>
          </TouchableOpacity>
        </View>

        {/* Trip selector */}
        <TouchableOpacity
          onPress={() => setShowTripPicker(true)}
          style={{
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: 14,
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.25)",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <MapPin size={16} color="rgba(255,255,255,0.8)" />
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
              {selectedTripObj
                ? `${selectedTripObj.trip_name}${selectedTripObj.start_date ? " – " + fmtDate(selectedTripObj.start_date) : ""}`
                : "All Trips"}
            </Text>
          </View>
          <ChevronDown size={18} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </LinearGradient>

      {/* ─── FILTER TABS ─── */}
      <View
        style={{
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#E2E8F0",
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderBottomWidth: 2.5,
                borderBottomColor:
                  activeTab === tab.id ? "#008C8F" : "transparent",
                marginRight: 4,
              }}
            >
              <Text
                style={{
                  color: activeTab === tab.id ? "#008C8F" : "#94A3B8",
                  fontWeight: activeTab === tab.id ? "800" : "600",
                  fontSize: 13,
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ─── CONTENT ─── */}
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#008C8F" />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 20,
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
          {documents.length === 0 ? (
            <View
              style={{
                alignItems: "center",
                paddingTop: 60,
                paddingHorizontal: 24,
              }}
            >
              <View
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 28,
                  backgroundColor: "#F1F5F9",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                {activeTab === "mine" && <FileText size={38} color="#CBD5E1" />}
                {activeTab === "shared" && <Globe size={38} color="#CBD5E1" />}
                {activeTab === "private" && <Lock size={38} color="#CBD5E1" />}
              </View>
              <Text
                style={{
                  color: "#0F172A",
                  fontSize: 18,
                  fontWeight: "800",
                  marginBottom: 8,
                  textAlign: "center",
                }}
              >
                {activeTab === "mine" && "No documents yet"}
                {activeTab === "shared" && "Nothing shared yet"}
                {activeTab === "private" && "No private documents"}
              </Text>
              <Text
                style={{
                  color: "#94A3B8",
                  fontSize: 14,
                  textAlign: "center",
                  lineHeight: 22,
                  marginBottom: 28,
                }}
              >
                {activeTab === "mine" &&
                  "Upload your boarding passes, hotel bookings, tickets and more."}
                {activeTab === "shared" &&
                  "Documents shared with you by your Travel Party will appear here."}
                {activeTab === "private" &&
                  "Upload documents that only you can see — passports, insurance, personal docs."}
              </Text>
              <TouchableOpacity
                onPress={() => setShowUploadModal(true)}
                style={{
                  backgroundColor: "#008C8F",
                  paddingHorizontal: 28,
                  paddingVertical: 14,
                  borderRadius: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Plus size={18} color="#fff" />
                <Text
                  style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}
                >
                  Upload Document
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            Object.entries(grouped).map(([tripLabel, docs]) => (
              <View key={tripLabel} style={{ marginBottom: 24 }}>
                {/* Trip group header */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{ flex: 1, height: 1, backgroundColor: "#E2E8F0" }}
                  />
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      backgroundColor: "#E2E8F0",
                      paddingHorizontal: 12,
                      paddingVertical: 5,
                      borderRadius: 20,
                      marginHorizontal: 10,
                    }}
                  >
                    <MapPin size={11} color="#64748B" />
                    <Text
                      style={{
                        color: "#64748B",
                        fontWeight: "800",
                        fontSize: 12,
                      }}
                    >
                      {tripLabel}
                    </Text>
                    <Text style={{ color: "#94A3B8", fontSize: 12 }}>
                      · {docs.length}
                    </Text>
                  </View>
                  <View
                    style={{ flex: 1, height: 1, backgroundColor: "#E2E8F0" }}
                  />
                </View>

                {docs.map((doc) => (
                  <WalletCard
                    key={doc.id}
                    doc={doc}
                    currentUserId={user?.id}
                    onView={() => setViewingDoc(doc)}
                    onDelete={() => deleteDoc(doc.id)}
                  />
                ))}
              </View>
            ))
          )}

          {/* Security badge */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              marginTop: 12,
              paddingVertical: 12,
              backgroundColor: "#F0FDF4",
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#BBF7D0",
            }}
          >
            <ShieldCheck size={16} color="#10B981" />
            <Text style={{ color: "#10B981", fontSize: 12, fontWeight: "700" }}>
              Secured with encryption · Only visible to authorised members
            </Text>
          </View>
        </ScrollView>
      )}

      {/* ─── TRIP PICKER MODAL ─── */}
      <Modal visible={showTripPicker} transparent animationType="slide">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowTripPicker(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "flex-end",
          }}
        >
          <TouchableOpacity activeOpacity={1}>
            <View
              style={{
                backgroundColor: "#fff",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingTop: 12,
                paddingBottom: insets.bottom + 20,
              }}
            >
              {/* Handle */}
              <View
                style={{
                  width: 40,
                  height: 4,
                  backgroundColor: "#E2E8F0",
                  borderRadius: 2,
                  alignSelf: "center",
                  marginBottom: 16,
                }}
              />

              <Text
                style={{
                  color: "#0F172A",
                  fontSize: 18,
                  fontWeight: "900",
                  paddingHorizontal: 20,
                  marginBottom: 16,
                }}
              >
                Filter by trip
              </Text>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 400 }}
              >
                {/* All trips option */}
                <TouchableOpacity
                  onPress={() => {
                    setSelectedTrip(null);
                    setShowTripPicker(false);
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: "#F1F5F9",
                    backgroundColor: !selectedTrip ? "#F0FDFA" : "transparent",
                  }}
                >
                  <View
                    style={{
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
                        backgroundColor: "#F1F5F9",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Wallet size={20} color="#64748B" />
                    </View>
                    <Text
                      style={{
                        color: "#0F172A",
                        fontWeight: "700",
                        fontSize: 15,
                      }}
                    >
                      All Trips
                    </Text>
                  </View>
                  {!selectedTrip && <Check size={20} color="#008C8F" />}
                </TouchableOpacity>

                {trips.map((trip) => (
                  <TouchableOpacity
                    key={trip.id}
                    onPress={() => {
                      setSelectedTrip(trip.id);
                      setShowTripPicker(false);
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingHorizontal: 20,
                      paddingVertical: 14,
                      borderBottomWidth: 1,
                      borderBottomColor: "#F1F5F9",
                      backgroundColor:
                        selectedTrip === trip.id ? "#F0FDFA" : "transparent",
                    }}
                  >
                    <View
                      style={{
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
                          backgroundColor: "#008C8F18",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <MapPin size={18} color="#008C8F" />
                      </View>
                      <View>
                        <Text
                          style={{
                            color: "#0F172A",
                            fontWeight: "700",
                            fontSize: 15,
                          }}
                        >
                          {trip.trip_name}
                        </Text>
                        <Text
                          style={{
                            color: "#94A3B8",
                            fontSize: 12,
                            marginTop: 1,
                          }}
                        >
                          {trip.destination_name}
                          {trip.start_date
                            ? " · " + fmtDate(trip.start_date)
                            : ""}
                        </Text>
                      </View>
                    </View>
                    {selectedTrip === trip.id && (
                      <Check size={20} color="#008C8F" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ─── UPLOAD MODAL ─── */}
      <Modal visible={showUploadModal} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.55)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingTop: 12,
              paddingBottom: insets.bottom + 20,
              maxHeight: "92%",
            }}
          >
            {/* Handle */}
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: "#E2E8F0",
                borderRadius: 2,
                alignSelf: "center",
                marginBottom: 16,
              }}
            />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 20,
                marginBottom: 20,
              }}
            >
              <View>
                <Text
                  style={{ color: "#0F172A", fontSize: 20, fontWeight: "900" }}
                >
                  Upload Document
                </Text>
                <Text style={{ color: "#94A3B8", fontSize: 13, marginTop: 2 }}>
                  PDF or image file
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowUploadModal(false);
                  setDocTitle("");
                  setUploadTripId(null);
                }}
                style={{
                  backgroundColor: "#F1F5F9",
                  padding: 8,
                  borderRadius: 12,
                }}
              >
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {/* Trip selector */}
              <Text
                style={{
                  color: "#374151",
                  fontWeight: "700",
                  fontSize: 13,
                  marginBottom: 8,
                }}
              >
                Trip *
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 20, flexGrow: 0 }}
              >
                {trips.map((trip) => (
                  <TouchableOpacity
                    key={trip.id}
                    onPress={() => setUploadTripId(trip.id)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderRadius: 14,
                      marginRight: 10,
                      borderWidth: 2,
                      backgroundColor:
                        uploadTripId === trip.id ? "#008C8F" : "#F8FAFC",
                      borderColor:
                        uploadTripId === trip.id ? "#008C8F" : "#E2E8F0",
                    }}
                  >
                    <Text
                      style={{
                        color: uploadTripId === trip.id ? "#fff" : "#374151",
                        fontWeight: "700",
                        fontSize: 13,
                      }}
                    >
                      {trip.trip_name}
                    </Text>
                    {trip.destination_name && (
                      <Text
                        style={{
                          color:
                            uploadTripId === trip.id
                              ? "rgba(255,255,255,0.75)"
                              : "#94A3B8",
                          fontSize: 11,
                          marginTop: 2,
                        }}
                      >
                        {trip.destination_name}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Title */}
              <Text
                style={{
                  color: "#374151",
                  fontWeight: "700",
                  fontSize: 13,
                  marginBottom: 8,
                }}
              >
                Document Title *
              </Text>
              <TextInput
                value={docTitle}
                onChangeText={setDocTitle}
                placeholder="e.g., Newcastle → Rhodes Flight"
                placeholderTextColor="#94A3B8"
                style={{
                  backgroundColor: "#F8FAFC",
                  borderWidth: 1.5,
                  borderColor: "#E2E8F0",
                  borderRadius: 14,
                  padding: 14,
                  fontSize: 15,
                  color: "#0F172A",
                  marginBottom: 20,
                }}
              />

              {/* Category */}
              <Text
                style={{
                  color: "#374151",
                  fontWeight: "700",
                  fontSize: 13,
                  marginBottom: 10,
                }}
              >
                Category
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 20,
                }}
              >
                {DOC_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t.value}
                    onPress={() => setDocType(t.value)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 1.5,
                      backgroundColor:
                        docType === t.value ? t.color : "#F8FAFC",
                      borderColor: docType === t.value ? t.color : "#E2E8F0",
                    }}
                  >
                    <Text style={{ fontSize: 14 }}>{t.emoji}</Text>
                    <Text
                      style={{
                        color: docType === t.value ? "#fff" : "#374151",
                        fontWeight: "700",
                        fontSize: 12,
                      }}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Visibility */}
              <Text
                style={{
                  color: "#374151",
                  fontWeight: "700",
                  fontSize: 13,
                  marginBottom: 10,
                }}
              >
                Who can see this?
              </Text>
              <View style={{ flexDirection: "row", gap: 12, marginBottom: 28 }}>
                <TouchableOpacity
                  onPress={() => setDocPrivate(false)}
                  style={{
                    flex: 1,
                    padding: 16,
                    borderRadius: 16,
                    alignItems: "center",
                    backgroundColor: !docPrivate ? "#F0FDFA" : "#F8FAFC",
                    borderWidth: 2,
                    borderColor: !docPrivate ? "#10B981" : "#E2E8F0",
                  }}
                >
                  <Globe
                    size={24}
                    color={!docPrivate ? "#10B981" : "#94A3B8"}
                  />
                  <Text
                    style={{
                      color: !docPrivate ? "#10B981" : "#94A3B8",
                      fontWeight: "800",
                      marginTop: 8,
                      fontSize: 13,
                      textAlign: "center",
                    }}
                  >
                    Share with{"\n"}Travel Party
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setDocPrivate(true)}
                  style={{
                    flex: 1,
                    padding: 16,
                    borderRadius: 16,
                    alignItems: "center",
                    backgroundColor: docPrivate ? "#F5F3FF" : "#F8FAFC",
                    borderWidth: 2,
                    borderColor: docPrivate ? "#6366F1" : "#E2E8F0",
                  }}
                >
                  <Lock size={24} color={docPrivate ? "#6366F1" : "#94A3B8"} />
                  <Text
                    style={{
                      color: docPrivate ? "#6366F1" : "#94A3B8",
                      fontWeight: "800",
                      marginTop: 8,
                      fontSize: 13,
                      textAlign: "center",
                    }}
                  >
                    Private –{"\n"}Only Me
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Upload button */}
              <TouchableOpacity
                onPress={pickAndUpload}
                disabled={uploading}
                style={{
                  backgroundColor: "#008C8F",
                  padding: 18,
                  borderRadius: 16,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 10,
                  opacity: uploading ? 0.7 : 1,
                }}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Upload size={20} color="#fff" />
                    <Text
                      style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}
                    >
                      Choose & Upload File
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Security note */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  marginTop: 16,
                }}
              >
                <ShieldCheck size={14} color="#10B981" />
                <Text style={{ color: "#64748B", fontSize: 12 }}>
                  Your documents are stored securely
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Document viewer */}
      <DocumentViewer
        visible={!!viewingDoc}
        document={viewingDoc}
        onClose={() => setViewingDoc(null)}
      />
    </View>
  );
}
