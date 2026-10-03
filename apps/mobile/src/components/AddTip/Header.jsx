import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MapPin } from "lucide-react-native";

export function Header({ insets, location, locationName }) {
  return (
    <LinearGradient
      colors={["#008C8F", "#7DE2D1"]}
      style={{
        paddingTop: insets.top,
        paddingBottom: 16,
      }}
    >
      <Text
        style={{
          fontSize: 32,
          fontWeight: "900",
          color: "#fff",
          textAlign: "center",
          marginTop: 8,
        }}
      >
        Share Your Story ✨
      </Text>
      {location && locationName && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 6,
          }}
        >
          <MapPin size={14} color="#FCD34D" />
          <Text
            style={{
              fontSize: 13,
              color: "#FFF",
              marginLeft: 4,
              opacity: 0.9,
              fontWeight: "600",
            }}
          >
            From: {locationName}
          </Text>
        </View>
      )}
    </LinearGradient>
  );
}
