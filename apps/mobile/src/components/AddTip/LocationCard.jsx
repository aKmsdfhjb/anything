import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MapPin } from "lucide-react-native";

export function LocationCard({ locationName, gettingLocation, onRefresh }) {
  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: "#FF006E",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: "#FF006E",
              marginBottom: 4,
            }}
          >
            📍 Your Location
          </Text>
          {gettingLocation ? (
            <ActivityIndicator size="small" color="#FF006E" />
          ) : locationName ? (
            <Text
              style={{
                fontSize: 14,
                color: "#0F172A",
                fontWeight: "600",
              }}
            >
              {locationName}
            </Text>
          ) : (
            <Text style={{ fontSize: 12, color: "#64748B" }}>
              Location not available
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={onRefresh}
          disabled={gettingLocation}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={["#FF006E", "#EC4899"]}
            style={{
              padding: 12,
              borderRadius: 12,
            }}
          >
            <MapPin size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}
