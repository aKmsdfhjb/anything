import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Heart, MapPin, Plus, Trash2 } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import useUser from "@/utils/auth/useUser";

export default function SavedPlacesScreen() {
  const insets = useSafeAreaInsets();
  const { data: user, loading: userLoading } = useUser();
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (user) {
      loadSavedPlaces();
      loadDestinations();
    }
  }, [user]);

  const loadSavedPlaces = async () => {
    try {
      const response = await fetch("/api/saved-places");
      if (!response.ok) throw new Error("Failed to load saved places");
      const data = await response.json();
      setSavedPlaces(data.places || []);
    } catch (error) {
      console.error("Error loading saved places:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDestinations = async () => {
    try {
      const response = await fetch("/api/destinations");
      if (!response.ok) throw new Error("Failed to load destinations");
      const data = await response.json();
      setDestinations(data.destinations || []);
    } catch (error) {
      console.error("Error loading destinations:", error);
    }
  };

  const savePlace = async () => {
    if (!selectedDestination) {
      Alert.alert("Error", "Please select a destination");
      return;
    }

    try {
      const response = await fetch("/api/saved-places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination_id: parseInt(selectedDestination),
          notes: notes || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to save place");

      setSelectedDestination("");
      setNotes("");
      setShowAddForm(false);
      loadSavedPlaces();
    } catch (error) {
      console.error("Error saving place:", error);
      Alert.alert("Error", "Could not save place");
    }
  };

  const removePlace = async (destinationId) => {
    Alert.alert("Remove Place", "Remove this place from your saved list?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(
              `/api/saved-places?destination_id=${destinationId}`,
              {
                method: "DELETE",
              },
            );
            if (!response.ok) throw new Error("Failed to remove place");
            loadSavedPlaces();
          } catch (error) {
            console.error("Error removing place:", error);
            Alert.alert("Error", "Could not remove place");
          }
        },
      },
    ]);
  };

  if (userLoading || loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000", paddingTop: insets.top }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          padding: 20,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 32, fontWeight: "bold", color: "#fff" }}>
          Saved Places
        </Text>
        <TouchableOpacity
          onPress={() => setShowAddForm(!showAddForm)}
          style={{ backgroundColor: "#EC4899", padding: 12, borderRadius: 12 }}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Add Place Form */}
      {showAddForm && (
        <View
          style={{
            backgroundColor: "#1A1A1A",
            margin: 20,
            padding: 20,
            borderRadius: 16,
            marginTop: 0,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "#fff",
              marginBottom: 16,
            }}
          >
            Save a Place
          </Text>

          <Text style={{ color: "#999", marginBottom: 8 }}>
            Choose Destination
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 16 }}
          >
            {destinations.map((dest) => (
              <TouchableOpacity
                key={dest.id}
                onPress={() => setSelectedDestination(dest.id.toString())}
                style={{
                  backgroundColor:
                    selectedDestination === dest.id.toString()
                      ? "#EC4899"
                      : "#2A2A2A",
                  padding: 12,
                  borderRadius: 8,
                  marginRight: 8,
                }}
              >
                <Text style={{ color: "#fff" }}>{dest.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={{ color: "#999", marginBottom: 8 }}>
            Notes (Optional)
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Why do you want to visit this place?"
            placeholderTextColor="#666"
            multiline
            numberOfLines={3}
            style={{
              backgroundColor: "#2A2A2A",
              color: "#fff",
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
              minHeight: 80,
            }}
          />

          <TouchableOpacity
            onPress={savePlace}
            style={{
              backgroundColor: "#EC4899",
              padding: 16,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
              Save Place
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Saved Places List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
          paddingTop: 10,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        {savedPlaces.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <Heart size={64} color="#666" />
            <Text
              style={{
                color: "#999",
                fontSize: 18,
                marginTop: 16,
                textAlign: "center",
              }}
            >
              No saved places yet.{"\n"}Start building your travel bucket list!
            </Text>
          </View>
        ) : (
          savedPlaces.map((place) => (
            <View
              key={place.id}
              style={{
                backgroundColor: "#1A1A1A",
                borderRadius: 16,
                overflow: "hidden",
                marginBottom: 16,
              }}
            >
              {place.image_url && (
                <Image
                  source={{ uri: place.image_url }}
                  style={{ width: "100%", height: 200 }}
                  contentFit="cover"
                />
              )}

              <View style={{ padding: 16 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 22,
                        fontWeight: "bold",
                        color: "#fff",
                        marginBottom: 8,
                      }}
                    >
                      {place.name}
                    </Text>

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <MapPin size={16} color="#EC4899" />
                      <Text style={{ color: "#EC4899", marginLeft: 6 }}>
                        {place.country}
                      </Text>
                    </View>

                    {place.description && (
                      <Text style={{ color: "#999", marginBottom: 12 }}>
                        {place.description}
                      </Text>
                    )}

                    {place.notes && (
                      <View
                        style={{
                          backgroundColor: "#2A2A2A",
                          padding: 12,
                          borderRadius: 8,
                          marginTop: 8,
                        }}
                      >
                        <Text style={{ color: "#fff", fontStyle: "italic" }}>
                          "{place.notes}"
                        </Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => removePlace(place.destination_id)}
                    style={{ padding: 8 }}
                  >
                    <Trash2 size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
