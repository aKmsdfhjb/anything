import { Text } from "react-native";

export function ProfileInfo({ username, email, bio }) {
  return (
    <>
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          color: "#111827",
          marginBottom: 4,
        }}
      >
        {username || "User"}
      </Text>
      <Text style={{ fontSize: 14, color: "#6B7280", marginBottom: 12 }}>
        {email}
      </Text>
      {bio && (
        <Text
          style={{
            fontSize: 14,
            color: "#374151",
            textAlign: "center",
            marginTop: 8,
          }}
        >
          {bio}
        </Text>
      )}
    </>
  );
}
