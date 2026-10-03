/**
 * TravelWalletSection — embeds the full Travel Wallet experience inside the
 * Profile screen. Styled to match the profile's white-card / light theme.
 *
 * Features
 * ─────────
 * • Fetches all documents from /api/wallet
 * • Type-filter chips (All · Flight · Hotel · …)
 * • Upload modal: pick trip → pick type → pick title → upload file
 * • View documents via DocumentViewer
 * • Delete with confirmation
 * • Pull-to-refresh baked in (call refresh() from parent if needed)
 */

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import {
  Wallet,
  Plus,
  Plane,
  Hotel,
  Car,
  Shield,
  Ticket,
  FileText,
  FileCheck,
  Bus,
  Utensils,
  Ship,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Upload,
  X,
  Lock,
  Globe,
} from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import useUpload from "@/utils/useUpload";
import DocumentViewer from "@/components/TripDocuments/DocumentViewer";

// ─── Constants ────────────────────────────────────────────────────────────────
const TEAL = "#008C8F";

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
    label: "Hotel",
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

function getDocConfig(value) {
  return (
    DOC_TYPES.find((d) => d.value === value) || DOC_TYPES[DOC_TYPES.length - 1]
  );
}

function fmtSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

// ─── Document card (light theme) ─────────────────────────────────────────────
function DocCard({ doc, onView, onDelete }) {
  const cfg = getDocConfig(doc.document_type);
  const Icon = cfg.icon;
  return (
    <View
      style={{
        backgroundColor: "#F8FAFC",
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
      }}
    >
      {/* Icon pill */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 13,
          backgroundColor: cfg.color + "18",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Icon size={20} color={cfg.color} />
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: "#0F172A",
            fontWeight: "800",
            fontSize: 14,
            marginBottom: 2,
          }}
          numberOfLines={1}
        >
          {doc.title}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginBottom: 6,
          }}
        >
          <Text
            style={{
              color: cfg.color,
              fontSize: 11,
              fontWeight: "700",
              textTransform: "uppercase",
            }}
          >
            {cfg.label}
          </Text>
          {doc.is_private && (
            <>
              <Text style={{ color: "#CBD5E1" }}>·</Text>
              <Lock size={10} color="#94A3B8" />
              <Text style={{ color: "#94A3B8", fontSize: 10 }}>Private</Text>
            </>
          )}
          {doc.trip_name && (
            <>
              <Text style={{ color: "#CBD5E1" }}>·</Text>
              <Text
                style={{ color: "#94A3B8", fontSize: 11 }}
                numberOfLines={1}
              >
                {doc.trip_name}
              </Text>
            </>
          )}
        </View>
        {doc.notes ? (
          <Text
            style={{ color: "#64748B", fontSize: 12, marginBottom: 8 }}
            numberOfLines={1}
          >
            {doc.notes}
          </Text>
        ) : null}
        {doc.file_size ? (
          <Text style={{ color: "#CBD5E1", fontSize: 11, marginBottom: 8 }}>
            {fmtSize(doc.file_size)}
          </Text>
        ) : null}

        {/* Actions */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={onView}
            style={{
              flex: 1,
              backgroundColor: cfg.color,
              borderRadius: 10,
              paddingVertical: 9,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
              View
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            style={{
              backgroundColor: "#FFF1F2",
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 9,
              alignItems: "center",
            }}
          >
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Upload Modal ─────────────────────────────────────────────────────────────
function UploadModal({ visible, trips, onClose, onUploaded }) {
  const [upload, { loading: uploading }] = useUpload();
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState("flight");
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [notes, setNotes] = useState("");
  const [showTripPicker, setShowTripPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  const selectedTrip = trips.find((t) => t.id === selectedTripId);
  const typeCfg = getDocConfig(docType);

  const reset = () => {
    setTitle("");
    setDocType("flight");
    setIsPrivate(false);
    setSelectedTripId(null);
    setNotes("");
    setShowTripPicker(false);
    setShowTypePicker(false);
  };

  const handlePickAndUpload = async () => {
    if (!title.trim()) {
      Alert.alert("Required", "Please enter a document title.");
      return;
    }
    if (!selectedTripId) {
      Alert.alert(
        "Required",
        "Please select a trip to attach this document to.",
      );
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const file = result.assets[0];
      const uploadedUrl = await upload(file.uri, file.mimeType);
      if (!uploadedUrl) throw new Error("Upload failed");

      const res = await fetch("/api/trip-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trip_id: selectedTripId,
          document_type: docType,
          title: title.trim(),
          file_url: uploadedUrl,
          file_type: file.mimeType || "application/octet-stream",
          file_size: file.size || null,
          notes: notes.trim() || null,
          is_private: isPrivate,
        }),
      });

      if (!res.ok) throw new Error("Could not save document");
      reset();
      onUploaded();
    } catch (err) {
      console.error("upload doc:", err);
      Alert.alert("Error", err.message || "Could not upload document");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen"
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            maxHeight: "90%",
            paddingBottom: 40,
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
              marginTop: 12,
              marginBottom: 4,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 22,
              paddingTop: 12,
              paddingBottom: 16,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "900", color: "#0F172A" }}>
              Add Document
            </Text>
            <TouchableOpacity
              onPress={() => {
                reset();
                onClose();
              }}
              style={{ padding: 6 }}
            >
              <X size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 20 }}
          >
            {/* Title */}
            <Text
              style={{
                color: "#374151",
                fontSize: 13,
                fontWeight: "700",
                marginBottom: 6,
              }}
            >
              Document Title *
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Outbound Flight — TUI TOM123"
              placeholderTextColor="#CBD5E1"
              style={{
                backgroundColor: "#F8FAFC",
                borderWidth: 1.5,
                borderColor: "#E2E8F0",
                borderRadius: 14,
                padding: 14,
                fontSize: 14,
                color: "#0F172A",
                marginBottom: 16,
              }}
            />

            {/* Document type */}
            <Text
              style={{
                color: "#374151",
                fontSize: 13,
                fontWeight: "700",
                marginBottom: 6,
              }}
            >
              Document Type *
            </Text>
            <TouchableOpacity
              onPress={() => setShowTypePicker((s) => !s)}
              style={{
                backgroundColor: "#F8FAFC",
                borderWidth: 1.5,
                borderColor: "#E2E8F0",
                borderRadius: 14,
                padding: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <Text style={{ fontSize: 20 }}>{typeCfg.emoji}</Text>
                <Text
                  style={{ color: "#0F172A", fontWeight: "700", fontSize: 14 }}
                >
                  {typeCfg.label}
                </Text>
              </View>
              {showTypePicker ? (
                <ChevronUp size={18} color="#94A3B8" />
              ) : (
                <ChevronDown size={18} color="#94A3B8" />
              )}
            </TouchableOpacity>
            {showTypePicker && (
              <View
                style={{
                  backgroundColor: "#F8FAFC",
                  borderWidth: 1.5,
                  borderColor: "#E2E8F0",
                  borderRadius: 14,
                  marginBottom: 16,
                  overflow: "hidden",
                }}
              >
                {DOC_TYPES.map((t, i) => (
                  <TouchableOpacity
                    key={t.value}
                    onPress={() => {
                      setDocType(t.value);
                      setShowTypePicker(false);
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      borderTopWidth: i > 0 ? 1 : 0,
                      borderTopColor: "#E2E8F0",
                      backgroundColor:
                        docType === t.value ? t.color + "12" : "transparent",
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>{t.emoji}</Text>
                    <Text
                      style={{
                        color: docType === t.value ? t.color : "#374151",
                        fontWeight: docType === t.value ? "800" : "600",
                        fontSize: 14,
                      }}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Trip selector */}
            <Text
              style={{
                color: "#374151",
                fontSize: 13,
                fontWeight: "700",
                marginBottom: 6,
              }}
            >
              Attach to Trip *
            </Text>
            <TouchableOpacity
              onPress={() => setShowTripPicker((s) => !s)}
              style={{
                backgroundColor: "#F8FAFC",
                borderWidth: 1.5,
                borderColor: selectedTripId ? TEAL : "#E2E8F0",
                borderRadius: 14,
                padding: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <Text
                style={{
                  color: selectedTrip ? "#0F172A" : "#CBD5E1",
                  fontWeight: selectedTrip ? "700" : "500",
                  fontSize: 14,
                }}
              >
                {selectedTrip ? selectedTrip.trip_name : "Select a trip…"}
              </Text>
              {showTripPicker ? (
                <ChevronUp size={18} color="#94A3B8" />
              ) : (
                <ChevronDown size={18} color="#94A3B8" />
              )}
            </TouchableOpacity>
            {showTripPicker && (
              <View
                style={{
                  backgroundColor: "#F8FAFC",
                  borderWidth: 1.5,
                  borderColor: "#E2E8F0",
                  borderRadius: 14,
                  marginBottom: 16,
                  overflow: "hidden",
                  maxHeight: 200,
                }}
              >
                <ScrollView>
                  {trips.length === 0 ? (
                    <Text
                      style={{
                        padding: 16,
                        color: "#94A3B8",
                        textAlign: "center",
                      }}
                    >
                      No trips yet — create one first
                    </Text>
                  ) : (
                    trips.map((t, i) => (
                      <TouchableOpacity
                        key={t.id}
                        onPress={() => {
                          setSelectedTripId(t.id);
                          setShowTripPicker(false);
                        }}
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 12,
                          borderTopWidth: i > 0 ? 1 : 0,
                          borderTopColor: "#E2E8F0",
                          backgroundColor:
                            selectedTripId === t.id ? "#F0FDFA" : "transparent",
                        }}
                      >
                        <Text
                          style={{
                            color: selectedTripId === t.id ? TEAL : "#374151",
                            fontWeight: "700",
                            fontSize: 14,
                          }}
                        >
                          {t.trip_name}
                        </Text>
                        {t.destination_name && (
                          <Text style={{ color: "#94A3B8", fontSize: 12 }}>
                            {t.destination_name}
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            )}

            {/* Notes */}
            <Text
              style={{
                color: "#374151",
                fontSize: 13,
                fontWeight: "700",
                marginBottom: 6,
              }}
            >
              Notes (optional)
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Departs Terminal 2, Gate B14"
              placeholderTextColor="#CBD5E1"
              multiline
              numberOfLines={2}
              style={{
                backgroundColor: "#F8FAFC",
                borderWidth: 1.5,
                borderColor: "#E2E8F0",
                borderRadius: 14,
                padding: 14,
                fontSize: 14,
                color: "#0F172A",
                marginBottom: 16,
                minHeight: 70,
                textAlignVertical: "top",
              }}
            />

            {/* Private toggle */}
            <TouchableOpacity
              onPress={() => setIsPrivate((p) => !p)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                backgroundColor: isPrivate ? "#FFF7ED" : "#F8FAFC",
                borderWidth: 1.5,
                borderColor: isPrivate ? "#F97316" : "#E2E8F0",
                borderRadius: 14,
                padding: 14,
                marginBottom: 24,
              }}
            >
              {isPrivate ? (
                <Lock size={18} color="#F97316" />
              ) : (
                <Globe size={18} color="#94A3B8" />
              )}
              <View style={{ flex: 1 }}>
                <Text
                  style={{ color: "#0F172A", fontWeight: "700", fontSize: 14 }}
                >
                  {isPrivate
                    ? "Private — only visible to you"
                    : "Shared — visible to travel party"}
                </Text>
                <Text style={{ color: "#94A3B8", fontSize: 12 }}>
                  Tap to toggle
                </Text>
              </View>
            </TouchableOpacity>

            {/* Upload button */}
            <TouchableOpacity
              onPress={handlePickAndUpload}
              disabled={uploading}
              style={{
                backgroundColor: TEAL,
                borderRadius: 16,
                paddingVertical: 16,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 10,
                opacity: uploading ? 0.7 : 1,
              }}
            >
              {uploading ? (
                <ActivityIndicator color="#fff" />
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
                marginTop: 14,
              }}
            >
              <ShieldCheck size={13} color="#10B981" />
              <Text style={{ color: "#94A3B8", fontSize: 12 }}>
                Your documents are stored securely
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function TravelWalletSection({ auth }) {
  const [docs, setDocs] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | flight | hotel | …
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [expanded, setExpanded] = useState(true);

  const loadWallet = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/wallet?filter=mine");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setDocs(data.documents || []);
      setTrips(data.trips || []);
    } catch (err) {
      console.error("loadWallet:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (auth) loadWallet();
  }, [auth, loadWallet]);

  const handleDelete = (docId) => {
    Alert.alert(
      "Remove Document",
      "Are you sure you want to remove this document?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`/api/trip-documents?id=${docId}`, {
                method: "DELETE",
              });
              if (!res.ok) throw new Error();
              setDocs((prev) => prev.filter((d) => d.id !== docId));
            } catch {
              Alert.alert("Error", "Could not remove document");
            }
          },
        },
      ],
    );
  };

  const filtered =
    filter === "all" ? docs : docs.filter((d) => d.document_type === filter);

  // Filter chips — only show types that have at least 1 doc
  const activeTypes = DOC_TYPES.filter((t) =>
    docs.some((d) => d.document_type === t.value),
  );

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 20,
        marginBottom: 20,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <TouchableOpacity
        onPress={() => setExpanded((e) => !e)}
        activeOpacity={0.8}
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 20,
          gap: 14,
        }}
      >
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            backgroundColor: "#F0FDFA",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Wallet size={22} color={TEAL} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#0F172A", fontSize: 17, fontWeight: "900" }}>
            Travel Wallet
          </Text>
          <Text style={{ color: "#94A3B8", fontSize: 12, marginTop: 1 }}>
            {loading
              ? "Loading…"
              : `${docs.length} document${docs.length !== 1 ? "s" : ""} stored`}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowUploadModal(true)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 11,
            backgroundColor: "#F0FDFA",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 6,
          }}
        >
          <Plus size={18} color={TEAL} strokeWidth={2.5} />
        </TouchableOpacity>
        {expanded ? (
          <ChevronUp size={20} color="#9CA3AF" />
        ) : (
          <ChevronDown size={20} color="#9CA3AF" />
        )}
      </TouchableOpacity>

      {expanded && (
        <View style={{ borderTopWidth: 1, borderTopColor: "#F1F5F9" }}>
          {loading ? (
            <View style={{ paddingVertical: 32, alignItems: "center" }}>
              <ActivityIndicator color={TEAL} />
            </View>
          ) : docs.length === 0 ? (
            /* ── Empty state ── */
            <View style={{ padding: 28, alignItems: "center" }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  backgroundColor: "#F0FDFA",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <Wallet size={30} color={TEAL} />
              </View>
              <Text
                style={{
                  color: "#0F172A",
                  fontSize: 16,
                  fontWeight: "800",
                  marginBottom: 6,
                  textAlign: "center",
                }}
              >
                Your wallet is empty
              </Text>
              <Text
                style={{
                  color: "#94A3B8",
                  fontSize: 13,
                  textAlign: "center",
                  marginBottom: 20,
                  lineHeight: 20,
                }}
              >
                Store flight confirmations, hotel bookings, tickets, insurance
                and more — all in one place.
              </Text>
              <TouchableOpacity
                onPress={() => setShowUploadModal(true)}
                style={{
                  backgroundColor: TEAL,
                  borderRadius: 14,
                  paddingHorizontal: 24,
                  paddingVertical: 13,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Plus size={16} color="#fff" strokeWidth={2.5} />
                <Text
                  style={{ color: "#fff", fontWeight: "800", fontSize: 14 }}
                >
                  Add First Document
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ padding: 16 }}>
              {/* ── Type filter chips ── */}
              {activeTypes.length > 1 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: 14, flexGrow: 0 }}
                  contentContainerStyle={{ gap: 8, paddingHorizontal: 2 }}
                >
                  <TouchableOpacity
                    onPress={() => setFilter("all")}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: filter === "all" ? TEAL : "#F1F5F9",
                    }}
                  >
                    <Text
                      style={{
                        color: filter === "all" ? "#fff" : "#64748B",
                        fontWeight: "700",
                        fontSize: 13,
                      }}
                    >
                      All ({docs.length})
                    </Text>
                  </TouchableOpacity>
                  {activeTypes.map((t) => {
                    const count = docs.filter(
                      (d) => d.document_type === t.value,
                    ).length;
                    const active = filter === t.value;
                    return (
                      <TouchableOpacity
                        key={t.value}
                        onPress={() => setFilter(t.value)}
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 20,
                          backgroundColor: active ? t.color : "#F1F5F9",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Text style={{ fontSize: 13 }}>{t.emoji}</Text>
                        <Text
                          style={{
                            color: active ? "#fff" : "#64748B",
                            fontWeight: "700",
                            fontSize: 13,
                          }}
                        >
                          {t.label} ({count})
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}

              {/* ── Document cards ── */}
              {filtered.length === 0 ? (
                <Text
                  style={{
                    color: "#94A3B8",
                    textAlign: "center",
                    paddingVertical: 24,
                    fontSize: 14,
                  }}
                >
                  No{" "}
                  {DOC_TYPES.find(
                    (t) => t.value === filter,
                  )?.label.toLowerCase()}{" "}
                  documents yet.
                </Text>
              ) : (
                filtered.map((doc) => (
                  <DocCard
                    key={doc.id}
                    doc={doc}
                    onView={() => setViewingDoc(doc)}
                    onDelete={() => handleDelete(doc.id)}
                  />
                ))
              )}

              {/* ── Add more button ── */}
              <TouchableOpacity
                onPress={() => setShowUploadModal(true)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  paddingVertical: 12,
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: "#E2E8F0",
                  borderStyle: "dashed",
                  marginTop: 4,
                }}
              >
                <Plus size={15} color={TEAL} strokeWidth={2.5} />
                <Text style={{ color: TEAL, fontWeight: "700", fontSize: 14 }}>
                  Add Document
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* ── Upload modal ──────────────────────────────────────────────────────── */}
      <UploadModal
        visible={showUploadModal}
        trips={trips}
        onClose={() => setShowUploadModal(false)}
        onUploaded={() => {
          setShowUploadModal(false);
          loadWallet();
        }}
      />

      {/* ── Document viewer ───────────────────────────────────────────────────── */}
      <DocumentViewer
        visible={!!viewingDoc}
        document={viewingDoc}
        onClose={() => setViewingDoc(null)}
      />
    </View>
  );
}
