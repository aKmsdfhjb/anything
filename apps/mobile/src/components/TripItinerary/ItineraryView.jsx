import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import {
  Plus,
  Clock,
  MapPin,
  Trash2,
  ChevronDown,
  ChevronUp,
  Utensils,
  Bus,
  Hotel,
  Camera,
  ShoppingBag,
  Moon,
  Sparkles,
  Package,
  User,
} from "lucide-react-native";

const CATEGORIES = [
  { value: "activity", label: "🎯 Activity", icon: Sparkles, color: "#3B82F6" },
  { value: "food", label: "🍽️ Food & Drink", icon: Utensils, color: "#F59E0B" },
  { value: "transport", label: "🚌 Transport", icon: Bus, color: "#8B5CF6" },
  { value: "accommodation", label: "🏨 Stay", icon: Hotel, color: "#10B981" },
  {
    value: "sightseeing",
    label: "📸 Sightseeing",
    icon: Camera,
    color: "#EC4899",
  },
  {
    value: "shopping",
    label: "🛍️ Shopping",
    icon: ShoppingBag,
    color: "#F97316",
  },
  { value: "nightlife", label: "🌙 Nightlife", icon: Moon, color: "#6366F1" },
  { value: "other", label: "📦 Other", icon: Package, color: "#64748B" },
];

function getCategoryInfo(cat) {
  return CATEGORIES.find((c) => c.value === cat) || CATEGORIES[7];
}

export default function ItineraryView({ tripId, tripStartDate, tripEndDate }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedDay, setExpandedDay] = useState(1);

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newCategory, setNewCategory] = useState("activity");
  const [newDayNumber, setNewDayNumber] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Calculate number of days in the trip
  const getTripDays = () => {
    if (!tripStartDate) return 1;
    const start = new Date(tripStartDate);
    const end = tripEndDate ? new Date(tripEndDate) : start;
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(diffDays, 1);
  };

  const totalDays = getTripDays();

  const formatDayDate = (dayNum) => {
    if (!tripStartDate) return "";
    const start = new Date(tripStartDate);
    start.setDate(start.getDate() + (dayNum - 1));
    return start.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    loadItinerary();
  }, [tripId]);

  const loadItinerary = async () => {
    try {
      const response = await fetch(`/api/itinerary?trip_id=${tripId}`);
      if (!response.ok) throw new Error("Failed to load itinerary");
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error("Error loading itinerary:", error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    if (!newTitle.trim()) {
      Alert.alert("Error", "Please enter a title for this plan");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trip_id: tripId,
          day_number: newDayNumber,
          title: newTitle.trim(),
          description: newDescription.trim() || null,
          start_time: newStartTime || null,
          end_time: newEndTime || null,
          location_name: newLocation.trim() || null,
          category: newCategory,
        }),
      });

      if (!response.ok) throw new Error("Failed to add item");

      // Reset form
      setNewTitle("");
      setNewDescription("");
      setNewStartTime("");
      setNewEndTime("");
      setNewLocation("");
      setNewCategory("activity");
      setShowAddForm(false);

      loadItinerary();
    } catch (error) {
      console.error("Error adding itinerary item:", error);
      Alert.alert("Error", "Could not add plan");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteItem = async (itemId) => {
    Alert.alert("Remove Plan", "Are you sure you want to remove this?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(`/api/itinerary?id=${itemId}`, {
              method: "DELETE",
            });
            if (!response.ok) throw new Error("Failed to delete");
            loadItinerary();
          } catch (error) {
            console.error("Error deleting item:", error);
            Alert.alert("Error", "Could not remove plan");
          }
        },
      },
    ]);
  };

  // Group items by day
  const itemsByDay = {};
  for (let d = 1; d <= totalDays; d++) {
    itemsByDay[d] = [];
  }
  items.forEach((item) => {
    const day = item.day_number;
    if (!itemsByDay[day]) itemsByDay[day] = [];
    itemsByDay[day].push(item);
  });

  if (loading) {
    return (
      <View style={{ padding: 40, alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Add Button */}
      <TouchableOpacity
        onPress={() => {
          setNewDayNumber(expandedDay || 1);
          setShowAddForm(!showAddForm);
        }}
        style={{
          backgroundColor: "#10B981",
          padding: 16,
          borderRadius: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <Plus size={20} color="#fff" />
        <Text
          style={{
            color: "#fff",
            fontWeight: "800",
            fontSize: 16,
            marginLeft: 8,
          }}
        >
          Add to Itinerary
        </Text>
      </TouchableOpacity>

      {/* Add Form */}
      {showAddForm && (
        <View
          style={{
            backgroundColor: "#1E293B",
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            borderWidth: 2,
            borderColor: "#10B981",
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "900",
              color: "#fff",
              marginBottom: 16,
            }}
          >
            ✨ New Plan
          </Text>

          {/* Day Selector */}
          <Text
            style={{ color: "#94A3B8", marginBottom: 8, fontWeight: "600" }}
          >
            Day
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 16, flexGrow: 0 }}
          >
            {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => (
              <TouchableOpacity
                key={day}
                onPress={() => setNewDayNumber(day)}
                style={{
                  backgroundColor: newDayNumber === day ? "#3B82F6" : "#0F172A",
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                  marginRight: 8,
                  borderWidth: 2,
                  borderColor: newDayNumber === day ? "#3B82F6" : "#334155",
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "700",
                    fontSize: 13,
                  }}
                >
                  Day {day}
                </Text>
                <Text style={{ color: "#94A3B8", fontSize: 11, marginTop: 2 }}>
                  {formatDayDate(day)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Category Selector */}
          <Text
            style={{ color: "#94A3B8", marginBottom: 8, fontWeight: "600" }}
          >
            Category
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 16, flexGrow: 0 }}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                onPress={() => setNewCategory(cat.value)}
                style={{
                  backgroundColor:
                    newCategory === cat.value ? cat.color : "#0F172A",
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 10,
                  marginRight: 8,
                  borderWidth: 2,
                  borderColor:
                    newCategory === cat.value ? cat.color : "#334155",
                }}
              >
                <Text
                  style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Title */}
          <Text
            style={{ color: "#94A3B8", marginBottom: 8, fontWeight: "600" }}
          >
            What's the plan?
          </Text>
          <TextInput
            value={newTitle}
            onChangeText={setNewTitle}
            placeholder="e.g., Visit Eiffel Tower"
            placeholderTextColor="#64748B"
            style={{
              backgroundColor: "#0F172A",
              color: "#fff",
              padding: 14,
              borderRadius: 12,
              marginBottom: 12,
              fontSize: 16,
              borderWidth: 2,
              borderColor: "#334155",
            }}
          />

          {/* Description */}
          <TextInput
            value={newDescription}
            onChangeText={setNewDescription}
            placeholder="Notes (optional)"
            placeholderTextColor="#64748B"
            multiline
            style={{
              backgroundColor: "#0F172A",
              color: "#fff",
              padding: 14,
              borderRadius: 12,
              marginBottom: 12,
              fontSize: 15,
              borderWidth: 2,
              borderColor: "#334155",
              minHeight: 60,
              textAlignVertical: "top",
            }}
          />

          {/* Time */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "#94A3B8",
                  marginBottom: 6,
                  fontWeight: "600",
                  fontSize: 13,
                }}
              >
                Start Time
              </Text>
              <TextInput
                value={newStartTime}
                onChangeText={setNewStartTime}
                placeholder="09:00"
                placeholderTextColor="#64748B"
                style={{
                  backgroundColor: "#0F172A",
                  color: "#fff",
                  padding: 12,
                  borderRadius: 10,
                  fontSize: 15,
                  borderWidth: 2,
                  borderColor: "#334155",
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "#94A3B8",
                  marginBottom: 6,
                  fontWeight: "600",
                  fontSize: 13,
                }}
              >
                End Time
              </Text>
              <TextInput
                value={newEndTime}
                onChangeText={setNewEndTime}
                placeholder="11:00"
                placeholderTextColor="#64748B"
                style={{
                  backgroundColor: "#0F172A",
                  color: "#fff",
                  padding: 12,
                  borderRadius: 10,
                  fontSize: 15,
                  borderWidth: 2,
                  borderColor: "#334155",
                }}
              />
            </View>
          </View>

          {/* Location */}
          <TextInput
            value={newLocation}
            onChangeText={setNewLocation}
            placeholder="📍 Location (optional)"
            placeholderTextColor="#64748B"
            style={{
              backgroundColor: "#0F172A",
              color: "#fff",
              padding: 14,
              borderRadius: 12,
              marginBottom: 16,
              fontSize: 15,
              borderWidth: 2,
              borderColor: "#334155",
            }}
          />

          {/* Submit */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={() => setShowAddForm(false)}
              style={{
                flex: 1,
                backgroundColor: "#334155",
                padding: 14,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={addItem}
              disabled={submitting}
              style={{
                flex: 2,
                backgroundColor: "#10B981",
                padding: 14,
                borderRadius: 12,
                alignItems: "center",
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text
                  style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}
                >
                  Add Plan ✨
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Day-by-Day View */}
      {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
        const dayItems = itemsByDay[day] || [];
        const isExpanded = expandedDay === day;

        return (
          <View key={day} style={{ marginBottom: 12 }}>
            <TouchableOpacity
              onPress={() => setExpandedDay(isExpanded ? null : day)}
              style={{
                backgroundColor: "#1E293B",
                padding: 16,
                borderRadius: isExpanded ? 16 : 12,
                borderBottomLeftRadius:
                  isExpanded && dayItems.length > 0 ? 0 : undefined,
                borderBottomRightRadius:
                  isExpanded && dayItems.length > 0 ? 0 : undefined,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    backgroundColor: "#3B82F6",
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "900",
                      fontSize: 16,
                    }}
                  >
                    {day}
                  </Text>
                </View>
                <View>
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "800",
                      fontSize: 16,
                    }}
                  >
                    Day {day}
                  </Text>
                  <Text style={{ color: "#94A3B8", fontSize: 13 }}>
                    {formatDayDate(day)} · {dayItems.length}{" "}
                    {dayItems.length === 1 ? "plan" : "plans"}
                  </Text>
                </View>
              </View>
              {isExpanded ? (
                <ChevronUp size={20} color="#94A3B8" />
              ) : (
                <ChevronDown size={20} color="#94A3B8" />
              )}
            </TouchableOpacity>

            {isExpanded && (
              <View
                style={{
                  backgroundColor: "#1E293B",
                  borderTopWidth: 1,
                  borderTopColor: "#334155",
                  borderBottomLeftRadius: 16,
                  borderBottomRightRadius: 16,
                  paddingBottom: 8,
                }}
              >
                {dayItems.length === 0 ? (
                  <View style={{ padding: 24, alignItems: "center" }}>
                    <Text
                      style={{
                        color: "#64748B",
                        fontSize: 14,
                        textAlign: "center",
                      }}
                    >
                      No plans yet for this day
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setNewDayNumber(day);
                        setShowAddForm(true);
                      }}
                      style={{
                        marginTop: 12,
                        backgroundColor: "#3B82F620",
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: "#3B82F6",
                          fontWeight: "700",
                          fontSize: 13,
                        }}
                      >
                        + Add something
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  dayItems.map((item, idx) => {
                    const catInfo = getCategoryInfo(item.category);
                    return (
                      <View
                        key={item.id}
                        style={{
                          marginHorizontal: 12,
                          marginTop: 10,
                          backgroundColor: "#0F172A",
                          borderRadius: 12,
                          padding: 14,
                          borderLeftWidth: 4,
                          borderLeftColor: catInfo.color,
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
                              }}
                            >
                              <View
                                style={{
                                  backgroundColor: catInfo.color + "20",
                                  paddingHorizontal: 8,
                                  paddingVertical: 3,
                                  borderRadius: 6,
                                  marginRight: 8,
                                }}
                              >
                                <Text
                                  style={{
                                    color: catInfo.color,
                                    fontSize: 11,
                                    fontWeight: "700",
                                  }}
                                >
                                  {catInfo.label}
                                </Text>
                              </View>
                              {item.start_time && (
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                  }}
                                >
                                  <Clock size={12} color="#94A3B8" />
                                  <Text
                                    style={{
                                      color: "#94A3B8",
                                      fontSize: 12,
                                      marginLeft: 4,
                                      fontWeight: "600",
                                    }}
                                  >
                                    {item.start_time}
                                    {item.end_time ? ` - ${item.end_time}` : ""}
                                  </Text>
                                </View>
                              )}
                            </View>

                            <Text
                              style={{
                                color: "#fff",
                                fontSize: 16,
                                fontWeight: "800",
                                marginBottom: 4,
                              }}
                            >
                              {item.title}
                            </Text>

                            {item.description && (
                              <Text
                                style={{
                                  color: "#94A3B8",
                                  fontSize: 14,
                                  marginBottom: 6,
                                  lineHeight: 20,
                                }}
                              >
                                {item.description}
                              </Text>
                            )}

                            {item.location_name && (
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  marginBottom: 4,
                                }}
                              >
                                <MapPin size={13} color="#64748B" />
                                <Text
                                  style={{
                                    color: "#64748B",
                                    fontSize: 13,
                                    marginLeft: 4,
                                  }}
                                >
                                  {item.location_name}
                                </Text>
                              </View>
                            )}

                            {item.added_by_username && (
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  marginTop: 4,
                                }}
                              >
                                <User size={11} color="#475569" />
                                <Text
                                  style={{
                                    color: "#475569",
                                    fontSize: 11,
                                    marginLeft: 4,
                                  }}
                                >
                                  Added by {item.added_by_username}
                                </Text>
                              </View>
                            )}
                          </View>

                          <TouchableOpacity
                            onPress={() => deleteItem(item.id)}
                            style={{
                              padding: 8,
                              backgroundColor: "#EF444415",
                              borderRadius: 8,
                              marginLeft: 8,
                            }}
                          >
                            <Trash2 size={16} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}
          </View>
        );
      })}

      {items.length === 0 && !showAddForm && (
        <View
          style={{
            backgroundColor: "#1E293B",
            borderRadius: 16,
            padding: 40,
            alignItems: "center",
            marginTop: 8,
            borderLeftWidth: 4,
            borderLeftColor: "#3B82F6",
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: "700",
              marginBottom: 8,
            }}
          >
            💡 Plan your trip day by day
          </Text>
          <Text
            style={{
              color: "#94A3B8",
              fontSize: 14,
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            Add activities, restaurants, transport, and more for each day. Your
            travel buddies can add their plans too!
          </Text>
        </View>
      )}
    </View>
  );
}
