import { View, Text } from "react-native";
import { MapPin } from "lucide-react-native";

export default function ClusterMarker({ count, onPress }) {
  // Size based on count
  const size = count > 100 ? 60 : count > 50 ? 50 : count > 10 ? 40 : 32;
  const fontSize = count > 100 ? 16 : count > 50 ? 14 : count > 10 ? 12 : 10;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#3B82F6",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
      }}
    >
      <Text
        style={{
          color: "#fff",
          fontSize: fontSize,
          fontWeight: "900",
        }}
      >
        {count > 999 ? "999+" : count}
      </Text>
    </View>
  );
}
