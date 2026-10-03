import { View, Text, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Users } from "lucide-react-native";

export function UnauthenticatedView({ insets, onSignIn }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#FAFBFC" }}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#FF006E", "#8B5CF6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top,
          paddingBottom: 16,
          alignItems: "center",
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
          Profile
        </Text>
      </LinearGradient>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 32,
        }}
      >
        <LinearGradient
          colors={["#FF006E", "#8B5CF6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Users size={40} color="#fff" />
        </LinearGradient>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "800",
            color: "#111827",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Welcome to Tip Trip
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: "#6B7280",
            textAlign: "center",
            lineHeight: 22,
            marginBottom: 32,
            paddingHorizontal: 16,
          }}
        >
          Sign in to set up your profile, find friends, and plan holidays
          together.
        </Text>
        <TouchableOpacity onPress={onSignIn}>
          <LinearGradient
            colors={["#FF006E", "#8B5CF6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingHorizontal: 40,
              paddingVertical: 16,
              borderRadius: 16,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 17, fontWeight: "800" }}>
              Sign In
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}
