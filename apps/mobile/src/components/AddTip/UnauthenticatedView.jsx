import { View, Text, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";

export function UnauthenticatedView({ insets, onSignIn }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={["#FF006E", "#8B5CF6"]}
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
      </LinearGradient>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: "#0F172A",
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          Sign in to share your travel tips & photos
        </Text>
        <TouchableOpacity onPress={onSignIn} activeOpacity={0.8}>
          <LinearGradient
            colors={["#FF006E", "#EC4899"]}
            style={{
              paddingHorizontal: 32,
              paddingVertical: 16,
              borderRadius: 14,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
              Sign In
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}
