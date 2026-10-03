import { View, Text, TouchableOpacity } from "react-native";
import { Plus } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export function TripsHeader({ tripCount, onAddPress }) {
  return (
    <LinearGradient
      colors={["#3B82F6", "#2563EB"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        padding: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 32,
            fontWeight: "900",
            color: "#fff",
            marginBottom: 4,
          }}
        >
          My Trips ✈️
        </Text>
        <Text style={{ fontSize: 14, color: "#fff", opacity: 0.9 }}>
          {tripCount} {tripCount === 1 ? "trip" : "trips"} planned
        </Text>
      </View>
      <TouchableOpacity
        onPress={onAddPress}
        style={{
          backgroundColor: "rgba(255,255,255,0.25)",
          padding: 14,
          borderRadius: 16,
        }}
      >
        <Plus size={28} color="#fff" strokeWidth={3} />
      </TouchableOpacity>
    </LinearGradient>
  );
}
