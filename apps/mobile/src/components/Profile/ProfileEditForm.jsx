import { View, Text, TextInput } from "react-native";

export function ProfileEditForm({
  username,
  bio,
  onUsernameChange,
  onBioChange,
}) {
  return (
    <View style={{ width: "100%" }}>
      <Text style={{ color: "#6B7280", marginBottom: 4 }}>Username</Text>
      <TextInput
        value={username}
        onChangeText={onUsernameChange}
        placeholder="Username"
        placeholderTextColor="#9CA3AF"
        style={{
          backgroundColor: "#F3F4F6",
          padding: 12,
          borderRadius: 8,
          marginBottom: 12,
          color: "#111827",
        }}
      />
      <Text style={{ color: "#6B7280", marginBottom: 4 }}>Bio</Text>
      <TextInput
        value={bio}
        onChangeText={onBioChange}
        placeholder="Bio"
        placeholderTextColor="#9CA3AF"
        multiline
        numberOfLines={3}
        style={{
          backgroundColor: "#F3F4F6",
          padding: 12,
          borderRadius: 8,
          minHeight: 80,
          color: "#111827",
        }}
      />
    </View>
  );
}
