import { View, Text, TouchableOpacity } from "react-native";
import { Video } from "lucide-react-native";

export function VideoSelector({ videoAsset, onPickVideo }) {
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
        Video
      </Text>
      <TouchableOpacity
        onPress={onPickVideo}
        style={{
          backgroundColor: "#fff",
          padding: 20,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: videoAsset ? "#8B5CF6" : "#E5E7EB",
          borderStyle: "dashed",
          alignItems: "center",
        }}
      >
        <Video color={videoAsset ? "#8B5CF6" : "#6B7280"} size={32} />
        <Text
          style={{
            marginTop: 8,
            fontSize: 14,
            color: videoAsset ? "#8B5CF6" : "#6B7280",
            fontWeight: "600",
          }}
        >
          {videoAsset ? "Video selected ✓" : "Tap to select video"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
