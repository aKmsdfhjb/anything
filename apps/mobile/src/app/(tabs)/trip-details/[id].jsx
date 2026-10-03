import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import {
  ArrowLeft,
  FileText,
  Users,
  CalendarDays,
  StickyNote,
  MapPin,
  Calendar,
  Upload,
  Lock,
  Globe,
  Trash2,
  ExternalLink,
  ShoppingBag,
  ChevronRight,
} from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import useUpload from "@/utils/useUpload";
import useUser from "@/utils/auth/useUser";
import DocumentViewer from "@/components/TripDocuments/DocumentViewer";
import ItineraryView from "@/components/TripItinerary/ItineraryView";
import CollaboratorsView from "@/components/TripCollaborators/CollaboratorsView";
import PackingListView from "@/components/PackingList/PackingListView";

const DOCUMENT_TYPES = [
  { value: "flight", label: "✈️ Flight", color: "#3B82F6" },
  { value: "hotel", label: "🏨 Accommodation", color: "#10B981" },
  { value: "excursion", label: "🚢 Excursion", color: "#F59E0B" },
  { value: "event", label: "🎫 Event / Attraction", color: "#EC4899" },
  { value: "restaurant", label: "🍽️ Restaurant", color: "#F97316" },
  { value: "transfer", label: "🚌 Transfer", color: "#8B5CF6" },
  { value: "car_hire", label: "🚗 Car Hire", color: "#06B6D4" },
  { value: "insurance", label: "🛡️ Insurance", color: "#EF4444" },
  { value: "other", label: "📎 Other", color: "#64748B" },
];

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "itinerary", label: "Itinerary" },
  { id: "documents", label: "Documents" },
  { id: "packing", label: "Packing" },
  { id: "party", label: "Travel Party" },
  { id: "notes", label: "Notes" },
];

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [upload] = useUpload();
  const { data: user } = useUser();

  const [trip, setTrip] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Document upload modal
  const [showDocModal, setShowDocModal] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docType, setDocType] = useState("flight");
  const [docPrivate, setDocPrivate] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Notes
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    loadAll();
  }, [id]);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadTrip(), loadDocuments(), loadNotes()]);
    setLoading(false);
  };

  const loadTrip = async () => {
    try {
      const res = await fetch(`/api/trips/${id}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setTrip(data.trip);
    } catch (err) {
      console.error("Load trip:", err);
      Alert.alert("Error", "Could not load trip details");
    }
  };

  const loadDocuments = async () => {
    try {
      const res = await fetch(`/api/trip-documents?trip_id=${id}`);
      if (!res.ok) return;
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error("Load docs:", err);
    }
  };

  const loadNotes = async () => {
    try {
      const res = await fetch(`/api/trip-notes?trip_id=${id}`);
      if (!res.ok) return;
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (err) {
      console.error("Load notes:", err);
    }
  };

  const pickAndUpload = async () => {
    if (!docTitle.trim()) {
      Alert.alert("Title required", "Please enter a title for this document.");
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
      const uploadResult = await upload({
        reactNativeAsset: { uri: file.uri, mimeType: file.mimeType },
      });
      if (uploadResult?.error) throw new Error(uploadResult.error);
      const uploadedUrl = uploadResult?.url;
      if (!uploadedUrl) throw new Error("Upload failed");

      const saveRes = await fetch("/api/trip-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trip_id: parseInt(id),
          document_type: docType,
          title: docTitle.trim(),
          file_url: uploadedUrl,
          file_type: file.mimeType || "application/octet-stream",
          file_size: file.size || null,
          is_private: docPrivate,
        }),
      });

      if (!saveRes.ok) throw new Error("Save failed");
      setShowDocModal(false);
      setDocTitle("");
      setDocType("flight");
      setDocPrivate(false);
      loadDocuments();
    } catch (err) {
      console.error("Upload error:", err);
      Alert.alert("Error", "Could not upload document. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = (docId) => {
    Alert.alert("Delete Document", "Remove this document?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await fetch(`/api/trip-documents?id=${docId}`, {
              method: "DELETE",
            });
            loadDocuments();
          } catch (err) {
            Alert.alert("Error", "Could not delete document");
          }
        },
      },
    ]);
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      const res = await fetch("/api/trip-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trip_id: parseInt(id),
          content: newNote.trim(),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setNewNote("");
      loadNotes();
    } catch (err) {
      Alert.alert("Error", "Could not add note");
    } finally {
      setAddingNote(false);
    }
  };

  const deleteNote = (noteId) => {
    Alert.alert("Delete Note", "Remove this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await fetch(`/api/trip-notes?id=${noteId}`, { method: "DELETE" });
            loadNotes();
          } catch (err) {
            Alert.alert("Error", "Could not delete note");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0F172A",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!trip) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0F172A",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <StatusBar style="light" />
        <Text style={{ color: "#fff", fontSize: 18, marginBottom: 20 }}>
          Trip not found or access denied.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: "#3B82F6",
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const destinationLabel =
    trip.destination_name || trip.custom_destination || "Unknown";
  const countryLabel =
    trip.country && trip.country !== "" ? `, ${trip.country}` : "";

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: "#0F172A", paddingTop: insets.top }}
    >
      <StatusBar style="light" />

      {/* ─── HERO HEADER ─── */}
      <View style={{ position: "relative" }}>
        {trip.cover_image ? (
          <View>
            <Image
              source={{ uri: trip.cover_image }}
              style={{ width: "100%", height: 190 }}
              contentFit="cover"
            />
            <LinearGradient
              colors={["rgba(15,23,42,0.2)", "rgba(15,23,42,0.92)"]}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 120,
              }}
            />
          </View>
        ) : (
          <LinearGradient
            colors={["#1E3A5F", "#0F172A"]}
            style={{ height: 110 }}
          />
        )}

        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            backgroundColor: "rgba(0,0,0,0.45)",
            borderRadius: 20,
            padding: 8,
          }}
        >
          <ArrowLeft size={22} color="#fff" />
        </TouchableOpacity>

        <View style={{ position: "absolute", bottom: 14, left: 16, right: 16 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "900",
              color: "#fff",
              marginBottom: 4,
            }}
            numberOfLines={2}
          >
            {trip.trip_name}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MapPin size={13} color="#94A3B8" />
            <Text
              style={{
                color: "#94A3B8",
                marginLeft: 5,
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              {destinationLabel}
              {countryLabel}
            </Text>
          </View>
        </View>
      </View>

      {/* ─── TAB BAR ─── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ backgroundColor: "#1E293B", maxHeight: 48 }}
        contentContainerStyle={{ paddingHorizontal: 8 }}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 14,
              borderBottomWidth: 2,
              borderBottomColor:
                activeTab === tab.id ? "#3B82F6" : "transparent",
            }}
          >
            <Text
              style={{
                color: activeTab === tab.id ? "#3B82F6" : "#94A3B8",
                fontWeight: activeTab === tab.id ? "800" : "600",
                fontSize: 13,
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ─── CONTENT ─── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 90,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ═══ OVERVIEW ═══ */}
        {activeTab === "overview" && (
          <View>
            <View
              style={{
                backgroundColor: "#1E293B",
                borderRadius: 16,
                padding: 18,
                marginBottom: 14,
              }}
            >
              <Text
                style={{
                  color: "#94A3B8",
                  fontSize: 11,
                  fontWeight: "800",
                  letterSpacing: 1,
                  marginBottom: 14,
                }}
              >
                TRIP DETAILS
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  marginBottom: 12,
                }}
              >
                <Calendar size={18} color="#3B82F6" style={{ marginTop: 1 }} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text
                    style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}
                  >
                    {formatDate(trip.start_date)}
                  </Text>
                  {trip.end_date && (
                    <Text
                      style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}
                    >
                      → {formatDate(trip.end_date)}
                    </Text>
                  )}
                  {trip.end_date && (
                    <Text
                      style={{ color: "#64748B", fontSize: 12, marginTop: 3 }}
                    >
                      {Math.ceil(
                        (new Date(trip.end_date) - new Date(trip.start_date)) /
                          86400000,
                      ) + 1}{" "}
                      days
                    </Text>
                  )}
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MapPin size={18} color="#10B981" />
                <Text
                  style={{
                    color: "#fff",
                    marginLeft: 12,
                    fontWeight: "700",
                    fontSize: 15,
                  }}
                >
                  {destinationLabel}
                  {countryLabel}
                </Text>
              </View>
            </View>

            {trip.description ? (
              <View
                style={{
                  backgroundColor: "#1E293B",
                  borderRadius: 16,
                  padding: 18,
                  marginBottom: 14,
                }}
              >
                <Text
                  style={{
                    color: "#94A3B8",
                    fontSize: 11,
                    fontWeight: "800",
                    letterSpacing: 1,
                    marginBottom: 10,
                  }}
                >
                  ABOUT THIS TRIP
                </Text>
                <Text
                  style={{ color: "#CBD5E1", fontSize: 15, lineHeight: 23 }}
                >
                  {trip.description}
                </Text>
              </View>
            ) : null}

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 14 }}>
              <TouchableOpacity
                onPress={() => setActiveTab("documents")}
                style={{
                  flex: 1,
                  backgroundColor: "#1E293B",
                  borderRadius: 16,
                  padding: 18,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "#3B82F6", fontSize: 28, fontWeight: "900" }}
                >
                  {documents.length}
                </Text>
                <Text
                  style={{
                    color: "#94A3B8",
                    fontSize: 12,
                    fontWeight: "600",
                    marginTop: 4,
                  }}
                >
                  Documents
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab("notes")}
                style={{
                  flex: 1,
                  backgroundColor: "#1E293B",
                  borderRadius: 16,
                  padding: 18,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "#F59E0B", fontSize: 28, fontWeight: "900" }}
                >
                  {notes.length}
                </Text>
                <Text
                  style={{
                    color: "#94A3B8",
                    fontSize: 12,
                    fontWeight: "600",
                    marginTop: 4,
                  }}
                >
                  Notes
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                backgroundColor: "#1E293B",
                borderRadius: 16,
                overflow: "hidden",
              }}
            >
              {[
                {
                  label: "Plan the Itinerary",
                  tab: "itinerary",
                  sub: "Day-by-day activities",
                },
                {
                  label: "Upload Documents",
                  action: () => {
                    setShowDocModal(true);
                  },
                  sub: "Flights, hotels, tickets…",
                },
                {
                  label: "Travel Party",
                  tab: "party",
                  sub: "Invite your travel companions",
                },
                {
                  label: "Add a Note",
                  tab: "notes",
                  sub: "Share info with the group",
                },
                {
                  label: "Packing List",
                  tab: "packing",
                  sub: "Track what to bring",
                },
              ].map((item, i, arr) => (
                <TouchableOpacity
                  key={i}
                  onPress={item.action || (() => setActiveTab(item.tab))}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 16,
                    borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                    borderBottomColor: "#0F172A",
                  }}
                >
                  <View>
                    <Text
                      style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={{ color: "#64748B", fontSize: 12, marginTop: 2 }}
                    >
                      {item.sub}
                    </Text>
                  </View>
                  <ChevronRight size={18} color="#334155" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ═══ ITINERARY ═══ */}
        {activeTab === "itinerary" && (
          <ItineraryView
            tripId={id}
            tripStartDate={trip.start_date}
            tripEndDate={trip.end_date}
          />
        )}

        {/* ═══ DOCUMENTS ═══ */}
        {activeTab === "documents" && (
          <View>
            <TouchableOpacity
              onPress={() => setShowDocModal(true)}
              style={{
                backgroundColor: "#3B82F6",
                borderRadius: 14,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Upload size={20} color="#fff" />
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "800",
                  fontSize: 16,
                  marginLeft: 10,
                }}
              >
                Upload Document
              </Text>
            </TouchableOpacity>

            {documents.length === 0 ? (
              <View
                style={{
                  backgroundColor: "#1E293B",
                  borderRadius: 16,
                  padding: 40,
                  alignItems: "center",
                }}
              >
                <FileText size={40} color="#334155" />
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: "700",
                    marginTop: 16,
                    marginBottom: 8,
                  }}
                >
                  No documents yet
                </Text>
                <Text
                  style={{
                    color: "#64748B",
                    fontSize: 14,
                    textAlign: "center",
                  }}
                >
                  Upload flight confirmations, hotel bookings, event tickets and
                  more.
                </Text>
              </View>
            ) : (
              documents.map((doc) => {
                const typeInfo =
                  DOCUMENT_TYPES.find((t) => t.value === doc.document_type) ||
                  DOCUMENT_TYPES[8];
                const isOwn = doc.user_id === user?.id;
                return (
                  <View
                    key={doc.id}
                    style={{
                      backgroundColor: "#1E293B",
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 12,
                      borderLeftWidth: 4,
                      borderLeftColor: typeInfo.color,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 6,
                            flexWrap: "wrap",
                            gap: 6,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 15,
                              fontWeight: "800",
                              color: "#fff",
                            }}
                          >
                            {doc.title}
                          </Text>
                          {doc.is_private ? (
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                backgroundColor: "#334155",
                                borderRadius: 8,
                                paddingHorizontal: 7,
                                paddingVertical: 3,
                              }}
                            >
                              <Lock size={10} color="#94A3B8" />
                              <Text
                                style={{
                                  color: "#94A3B8",
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
                                backgroundColor: "#064E3B",
                                borderRadius: 8,
                                paddingHorizontal: 7,
                                paddingVertical: 3,
                              }}
                            >
                              <Globe size={10} color="#10B981" />
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
                        <Text
                          style={{
                            color: typeInfo.color,
                            fontWeight: "700",
                            fontSize: 12,
                            marginBottom: 4,
                          }}
                        >
                          {typeInfo.label}
                        </Text>
                        {doc.added_by_username && (
                          <Text style={{ color: "#64748B", fontSize: 12 }}>
                            Added by {doc.added_by_username}
                          </Text>
                        )}
                      </View>
                      <View
                        style={{ flexDirection: "row", gap: 8, marginLeft: 10 }}
                      >
                        <TouchableOpacity
                          onPress={() => setSelectedDocument(doc)}
                          style={{
                            backgroundColor: "#334155",
                            padding: 10,
                            borderRadius: 10,
                          }}
                        >
                          <ExternalLink size={15} color="#fff" />
                        </TouchableOpacity>
                        {isOwn && (
                          <TouchableOpacity
                            onPress={() => deleteDocument(doc.id)}
                            style={{
                              backgroundColor: "#EF444415",
                              padding: 10,
                              borderRadius: 10,
                            }}
                          >
                            <Trash2 size={15} color="#EF4444" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ═══ PACKING ═══ */}
        {activeTab === "packing" && <PackingListView tripId={id} />}

        {/* ═══ TRAVEL PARTY ═══ */}
        {activeTab === "party" && <CollaboratorsView tripId={id} />}

        {/* ═══ NOTES ═══ */}
        {activeTab === "notes" && (
          <View>
            <View
              style={{
                backgroundColor: "#1E293B",
                borderRadius: 16,
                padding: 16,
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  color: "#94A3B8",
                  fontSize: 12,
                  fontWeight: "700",
                  marginBottom: 10,
                }}
              >
                Add a Note
              </Text>
              <TextInput
                value={newNote}
                onChangeText={setNewNote}
                placeholder="Write a note for the group…"
                placeholderTextColor="#64748B"
                multiline
                style={{
                  backgroundColor: "#0F172A",
                  color: "#fff",
                  padding: 14,
                  borderRadius: 12,
                  fontSize: 15,
                  borderWidth: 2,
                  borderColor: "#334155",
                  minHeight: 90,
                  textAlignVertical: "top",
                  marginBottom: 12,
                }}
              />
              <TouchableOpacity
                onPress={addNote}
                disabled={addingNote || !newNote.trim()}
                style={{
                  backgroundColor: newNote.trim() ? "#3B82F6" : "#334155",
                  padding: 14,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                {addingNote ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text
                    style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}
                  >
                    Add Note
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {notes.length === 0 ? (
              <View
                style={{
                  backgroundColor: "#1E293B",
                  borderRadius: 16,
                  padding: 40,
                  alignItems: "center",
                }}
              >
                <StickyNote size={40} color="#334155" />
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: "700",
                    marginTop: 16,
                    marginBottom: 8,
                  }}
                >
                  No notes yet
                </Text>
                <Text
                  style={{
                    color: "#64748B",
                    fontSize: 14,
                    textAlign: "center",
                  }}
                >
                  Add notes, reminders and ideas for your travel party.
                </Text>
              </View>
            ) : (
              notes.map((note) => (
                <View
                  key={note.id}
                  style={{
                    backgroundColor: "#1E293B",
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                    borderLeftWidth: 3,
                    borderLeftColor: "#F59E0B",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 15,
                        lineHeight: 22,
                        flex: 1,
                      }}
                    >
                      {note.content}
                    </Text>
                    {note.user_id === user?.id && (
                      <TouchableOpacity
                        onPress={() => deleteNote(note.id)}
                        style={{ marginLeft: 12, padding: 6 }}
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginTop: 10,
                    }}
                  >
                    <Text
                      style={{
                        color: "#3B82F6",
                        fontSize: 12,
                        fontWeight: "700",
                      }}
                    >
                      {note.added_by_username || "You"}
                    </Text>
                    <Text style={{ color: "#475569", fontSize: 11 }}>
                      {new Date(note.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* ─── DOCUMENT UPLOAD MODAL ─── */}
      <Modal visible={showDocModal} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.75)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#1E293B",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: insets.bottom + 20,
              maxHeight: "90%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 20, fontWeight: "900" }}>
                Upload Document
              </Text>
              <TouchableOpacity onPress={() => setShowDocModal(false)}>
                <Text style={{ color: "#64748B", fontSize: 15 }}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text
                style={{ color: "#94A3B8", fontWeight: "700", marginBottom: 8 }}
              >
                Document Title *
              </Text>
              <TextInput
                value={docTitle}
                onChangeText={setDocTitle}
                placeholder="e.g., Newcastle → Rhodes Flight"
                placeholderTextColor="#64748B"
                style={{
                  backgroundColor: "#0F172A",
                  color: "#fff",
                  padding: 14,
                  borderRadius: 12,
                  marginBottom: 18,
                  fontSize: 15,
                  borderWidth: 2,
                  borderColor: "#334155",
                }}
              />

              <Text
                style={{
                  color: "#94A3B8",
                  fontWeight: "700",
                  marginBottom: 10,
                }}
              >
                Category
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 18, flexGrow: 0 }}
              >
                {DOCUMENT_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t.value}
                    onPress={() => setDocType(t.value)}
                    style={{
                      backgroundColor:
                        docType === t.value ? t.color : "#0F172A",
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 12,
                      marginRight: 10,
                      borderWidth: 2,
                      borderColor: docType === t.value ? t.color : "#334155",
                    }}
                  >
                    <Text
                      style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Privacy */}
              <Text
                style={{
                  color: "#94A3B8",
                  fontWeight: "700",
                  marginBottom: 10,
                }}
              >
                Who can see this?
              </Text>
              <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
                <TouchableOpacity
                  onPress={() => setDocPrivate(false)}
                  style={{
                    flex: 1,
                    padding: 16,
                    borderRadius: 14,
                    alignItems: "center",
                    backgroundColor: !docPrivate ? "#064E3B" : "#0F172A",
                    borderWidth: 2,
                    borderColor: !docPrivate ? "#10B981" : "#334155",
                  }}
                >
                  <Globe
                    size={22}
                    color={!docPrivate ? "#10B981" : "#64748B"}
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
                    borderRadius: 14,
                    alignItems: "center",
                    backgroundColor: docPrivate ? "#1E1B4B" : "#0F172A",
                    borderWidth: 2,
                    borderColor: docPrivate ? "#6366F1" : "#334155",
                  }}
                >
                  <Lock size={22} color={docPrivate ? "#6366F1" : "#64748B"} />
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

              <TouchableOpacity
                onPress={pickAndUpload}
                disabled={uploading}
                style={{
                  backgroundColor: "#3B82F6",
                  padding: 18,
                  borderRadius: 14,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Upload size={20} color="#fff" />
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "800",
                        fontSize: 16,
                        marginLeft: 10,
                      }}
                    >
                      Choose & Upload File
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <DocumentViewer
        visible={!!selectedDocument}
        document={selectedDocument}
        onClose={() => setSelectedDocument(null)}
      />
    </View>
  );
}
