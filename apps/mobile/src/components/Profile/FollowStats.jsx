import { View, Text } from "react-native";

export function FollowStats({ friendsCount, followersCount, followingCount }) {
  const stats = [
    { value: friendsCount ?? 0, label: "Friends" },
    { value: followersCount ?? 0, label: "Followers" },
    { value: followingCount ?? 0, label: "Following" },
  ];

  return (
    <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
      {stats.map((stat) => (
        <View
          key={stat.label}
          style={{
            flex: 1,
            backgroundColor: "#fff",
            paddingVertical: 14,
            paddingHorizontal: 8,
            borderRadius: 14,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "900", color: "#111827" }}>
            {stat.value}
          </Text>
          <Text
            style={{
              color: "#9CA3AF",
              marginTop: 2,
              fontSize: 12,
              fontWeight: "600",
            }}
          >
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
