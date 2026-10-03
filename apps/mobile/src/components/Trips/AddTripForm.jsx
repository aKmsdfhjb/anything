import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState } from "react";
import { Plane, Camera, X } from "lucide-react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import useUpload from "@/utils/useUpload";

export function AddTripForm({
  tripName,
  setTripName,
  customDestination,
  setCustomDestination,
  selectedDestination,
  setSelectedDestination,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  description,
  setDescription,
  coverImage,
  setCoverImage,
  destinations,
  onSubmit,
}) {
  const [upload, { loading: uploading }] = useUpload();
  const [useCustomDest, setUseCustomDest] = useState(true);

  const pickCoverImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please allow access to your photos.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        const { url, error } = await upload({
          reactNativeAsset: result.assets[0],
        });
        if (error) {
          Alert.alert("Upload Error", error);
          return;
        }
        if (url) setCoverImage(url);
      }
    } catch (err) {
      console.error("Cover image error:", err);
      Alert.alert("Error", "Could not upload image.");
    }
  };

  return (
    <View
      style={{
        backgroundColor: "#1E293B",
        margin: 20,
        padding: 20,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}
      >
        <Plane size={24} color="#3B82F6" />
        <Text
          style={{
            fontSize: 22,
            fontWeight: "900",
            color: "#fff",
            marginLeft: 12,
          }}
        >
          Plan New Trip
        </Text>
      </View>

      {/* Cover Photo */}
      <Text style={{ color: "#94A3B8", marginBottom: 8, fontWeight: "600" }}>
        Cover Photo
      </Text>
      <TouchableOpacity
        onPress={pickCoverImage}
        disabled={uploading}
        style={{
          backgroundColor: "#0F172A",
          borderRadius: 12,
          marginBottom: 16,
          overflow: "hidden",
          borderWidth: 2,
          borderColor: "#334155",
          minHeight: 110,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {uploading ? (
          <View style={{ alignItems: "center", padding: 20 }}>
            <ActivityIndicator color="#3B82F6" size="small" />
            <Text style={{ color: "#94A3B8", marginTop: 8, fontSize: 13 }}>
              Uploading…
            </Text>
          </View>
        ) : coverImage ? (
          <View style={{ width: "100%" }}>
            <Image
              source={{ uri: coverImage }}
              style={{ width: "100%", height: 130 }}
              contentFit="cover"
            />
            <TouchableOpacity
              onPress={() => setCoverImage(null)}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                backgroundColor: "rgba(0,0,0,0.6)",
                borderRadius: 16,
                padding: 4,
              }}
            >
              <X size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ alignItems: "center", padding: 20 }}>
            <Camera size={28} color="#64748B" />
            <Text
              style={{
                color: "#64748B",
                fontSize: 13,
                marginTop: 8,
                fontWeight: "600",
              }}
            >
              Tap to add a cover photo
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Trip Name */}
      <Text style={{ color: "#94A3B8", marginBottom: 8, fontWeight: "600" }}>
        Trip Name *
      </Text>
      <TextInput
        value={tripName}
        onChangeText={setTripName}
        placeholder="e.g., Rhodes 2027"
        placeholderTextColor="#64748B"
        style={{
          backgroundColor: "#0F172A",
          color: "#fff",
          padding: 14,
          borderRadius: 12,
          marginBottom: 16,
          fontSize: 16,
          borderWidth: 2,
          borderColor: "#334155",
        }}
      />

      {/* Destination toggle */}
      <Text style={{ color: "#94A3B8", marginBottom: 8, fontWeight: "600" }}>
        Destination *
      </Text>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#0F172A",
          borderRadius: 10,
          padding: 4,
          marginBottom: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            setUseCustomDest(true);
            setSelectedDestination("");
          }}
          style={{
            flex: 1,
            paddingVertical: 8,
            alignItems: "center",
            borderRadius: 8,
            backgroundColor: useCustomDest ? "#3B82F6" : "transparent",
          }}
        >
          <Text
            style={{
              color: useCustomDest ? "#fff" : "#94A3B8",
              fontWeight: "700",
              fontSize: 13,
            }}
          >
            Type destination
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setUseCustomDest(false);
            setCustomDestination("");
          }}
          style={{
            flex: 1,
            paddingVertical: 8,
            alignItems: "center",
            borderRadius: 8,
            backgroundColor: !useCustomDest ? "#3B82F6" : "transparent",
          }}
        >
          <Text
            style={{
              color: !useCustomDest ? "#fff" : "#94A3B8",
              fontWeight: "700",
              fontSize: 13,
            }}
          >
            Browse list
          </Text>
        </TouchableOpacity>
      </View>

      {useCustomDest ? (
        <TextInput
          value={customDestination}
          onChangeText={setCustomDestination}
          placeholder="e.g., Rhodes, Greece"
          placeholderTextColor="#64748B"
          style={{
            backgroundColor: "#0F172A",
            color: "#fff",
            padding: 14,
            borderRadius: 12,
            marginBottom: 16,
            fontSize: 16,
            borderWidth: 2,
            borderColor: "#334155",
          }}
        />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16, flexGrow: 0 }}
        >
          {destinations.map((dest) => (
            <TouchableOpacity
              key={dest.id}
              onPress={() => setSelectedDestination(dest.id.toString())}
              style={{
                backgroundColor:
                  selectedDestination === dest.id.toString()
                    ? "#3B82F6"
                    : "#0F172A",
                padding: 14,
                borderRadius: 12,
                marginRight: 10,
                borderWidth: 2,
                borderColor:
                  selectedDestination === dest.id.toString()
                    ? "#3B82F6"
                    : "#334155",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                {dest.name}
              </Text>
              {dest.country && (
                <Text style={{ color: "#94A3B8", fontSize: 11, marginTop: 2 }}>
                  {dest.country}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Start Date */}
      <Text style={{ color: "#94A3B8", marginBottom: 8, fontWeight: "600" }}>
        Start Date * (YYYY-MM-DD)
      </Text>
      <TextInput
        value={startDate}
        onChangeText={setStartDate}
        placeholder="2027-09-04"
        placeholderTextColor="#64748B"
        style={{
          backgroundColor: "#0F172A",
          color: "#fff",
          padding: 14,
          borderRadius: 12,
          marginBottom: 16,
          fontSize: 16,
          borderWidth: 2,
          borderColor: "#334155",
        }}
      />

      {/* End Date */}
      <Text style={{ color: "#94A3B8", marginBottom: 8, fontWeight: "600" }}>
        End Date (YYYY-MM-DD)
      </Text>
      <TextInput
        value={endDate}
        onChangeText={setEndDate}
        placeholder="2027-09-14"
        placeholderTextColor="#64748B"
        style={{
          backgroundColor: "#0F172A",
          color: "#fff",
          padding: 14,
          borderRadius: 12,
          marginBottom: 16,
          fontSize: 16,
          borderWidth: 2,
          borderColor: "#334155",
        }}
      />

      {/* Description */}
      <Text style={{ color: "#94A3B8", marginBottom: 8, fontWeight: "600" }}>
        Description (optional)
      </Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Add a description of your trip…"
        placeholderTextColor="#64748B"
        multiline
        numberOfLines={3}
        style={{
          backgroundColor: "#0F172A",
          color: "#fff",
          padding: 14,
          borderRadius: 12,
          marginBottom: 20,
          minHeight: 80,
          fontSize: 16,
          borderWidth: 2,
          borderColor: "#334155",
          textAlignVertical: "top",
        }}
      />

      <TouchableOpacity
        onPress={onSubmit}
        style={{
          backgroundColor: "#10B981",
          padding: 18,
          borderRadius: 14,
          alignItems: "center",
          shadowColor: "#10B981",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 17, fontWeight: "800" }}>
          Create Trip 🎉
        </Text>
      </TouchableOpacity>
    </View>
  );
}
