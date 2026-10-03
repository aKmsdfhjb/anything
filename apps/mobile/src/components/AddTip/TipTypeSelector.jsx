import { View, Text, TouchableOpacity } from "react-native";
import { FileText, Video } from "lucide-react-native";

export function TipTypeSelector({ tipType, onTypeChange }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: "#374151",
          marginBottom: 8,
        }}
      >
        Tip Type
      </Text>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <TouchableOpacity
          onPress={() => onTypeChange("text")}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            borderRadius: 12,
            backgroundColor: tipType === "text" ? "#3B82F6" : "#fff",
            borderWidth: 2,
            borderColor: tipType === "text" ? "#3B82F6" : "#E5E7EB",
          }}
        >
          <FileText color={tipType === "text" ? "#fff" : "#6B7280"} size={20} />
          <Text
            style={{
              marginLeft: 8,
              fontSize: 14,
              fontWeight: "600",
              color: tipType === "text" ? "#fff" : "#6B7280",
            }}
          >
            Text
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onTypeChange("video")}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            borderRadius: 12,
            backgroundColor: tipType === "video" ? "#8B5CF6" : "#fff",
            borderWidth: 2,
            borderColor: tipType === "video" ? "#8B5CF6" : "#E5E7EB",
          }}
        >
          <Video color={tipType === "video" ? "#fff" : "#6B7280"} size={20} />
          <Text
            style={{
              marginLeft: 8,
              fontSize: 14,
              fontWeight: "600",
              color: tipType === "video" ? "#fff" : "#6B7280",
            }}
          >
            Video
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
