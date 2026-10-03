import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Share2 } from "lucide-react-native";

export function SubmitButton({ onSubmit, isLoading, disabled }) {
  return (
    <TouchableOpacity
      onPress={onSubmit}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      style={{
        opacity: disabled || isLoading ? 0.6 : 1,
      }}
    >
      <LinearGradient
        colors={["#008C8F", "#7DE2D1"]}
        style={{
          padding: 18,
          borderRadius: 14,
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "center",
          shadowColor: "#008C8F",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Share2 color="#fff" size={20} />
            <Text
              style={{
                color: "#fff",
                fontSize: 16,
                fontWeight: "800",
                marginLeft: 8,
              }}
            >
              Share My Tip 🚀
            </Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}
