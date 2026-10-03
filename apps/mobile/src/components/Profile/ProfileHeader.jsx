import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Edit, Check } from "lucide-react-native";

export function ProfileHeader({ insets, isEditing, onToggleEdit }) {
  return (
    <LinearGradient
      colors={["#FF006E", "#8B5CF6"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        paddingTop: insets.top,
        paddingBottom: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
      }}
    >
      <Text
        style={{
          fontSize: 26,
          fontWeight: "900",
          color: "#fff",
          marginTop: 8,
        }}
      >
        My Profile
      </Text>
      <TouchableOpacity
        onPress={onToggleEdit}
        style={{
          backgroundColor: "rgba(255,255,255,0.2)",
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
        }}
      >
        {isEditing ? (
          <>
            <Check color="#fff" size={16} />
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>
              Save
            </Text>
          </>
        ) : (
          <>
            <Edit color="#fff" size={16} />
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>
              Edit
            </Text>
          </>
        )}
      </TouchableOpacity>
    </LinearGradient>
  );
}
