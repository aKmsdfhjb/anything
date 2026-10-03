import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Camera } from "lucide-react-native";
import { Image } from "expo-image";

export function ProfilePicture({ displayImage, username, uploading, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      disabled={uploading}
      style={{ marginBottom: 16 }}
    >
      <View
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: "#3B82F6",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {uploading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : displayImage ? (
          <Image
            source={{ uri: displayImage }}
            style={{ width: 100, height: 100 }}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <Text
            style={{
              color: "#fff",
              fontSize: 40,
              fontWeight: "bold",
            }}
          >
            {username?.[0]?.toUpperCase() || "U"}
          </Text>
        )}
      </View>
      <View
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          backgroundColor: "#3B82F6",
          width: 32,
          height: 32,
          borderRadius: 16,
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 3,
          borderColor: "#fff",
        }}
      >
        <Camera size={14} color="#fff" />
      </View>
    </TouchableOpacity>
  );
}
