import { TouchableOpacity, Text } from "react-native";
import { LogOut } from "lucide-react-native";

export function SignOutButton({ onSignOut }) {
  return (
    <TouchableOpacity
      onPress={onSignOut}
      style={{
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#EF4444",
        padding: 16,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <LogOut color="#EF4444" size={20} />
      <Text
        style={{
          marginLeft: 8,
          fontSize: 16,
          fontWeight: "600",
          color: "#EF4444",
        }}
      >
        Sign Out
      </Text>
    </TouchableOpacity>
  );
}
