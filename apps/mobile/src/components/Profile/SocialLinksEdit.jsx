import { View, Text, TextInput } from "react-native";

export function SocialLinksEdit({
  facebookUrl,
  tiktokUrl,
  twitterUrl,
  instagramUrl,
  onFacebookChange,
  onTiktokChange,
  onTwitterChange,
  onInstagramChange,
}) {
  return (
    <View>
      <Text style={{ color: "#6B7280", marginBottom: 4 }}>Facebook URL</Text>
      <TextInput
        value={facebookUrl}
        onChangeText={onFacebookChange}
        placeholder="https://facebook.com/yourprofile"
        placeholderTextColor="#9CA3AF"
        style={{
          backgroundColor: "#F3F4F6",
          color: "#111827",
          padding: 12,
          borderRadius: 8,
          marginBottom: 12,
        }}
      />
      <Text style={{ color: "#6B7280", marginBottom: 4 }}>TikTok URL</Text>
      <TextInput
        value={tiktokUrl}
        onChangeText={onTiktokChange}
        placeholder="https://tiktok.com/@yourprofile"
        placeholderTextColor="#9CA3AF"
        style={{
          backgroundColor: "#F3F4F6",
          color: "#111827",
          padding: 12,
          borderRadius: 8,
          marginBottom: 12,
        }}
      />
      <Text style={{ color: "#6B7280", marginBottom: 4 }}>Twitter URL</Text>
      <TextInput
        value={twitterUrl}
        onChangeText={onTwitterChange}
        placeholder="https://twitter.com/yourprofile"
        placeholderTextColor="#9CA3AF"
        style={{
          backgroundColor: "#F3F4F6",
          color: "#111827",
          padding: 12,
          borderRadius: 8,
          marginBottom: 12,
        }}
      />
      <Text style={{ color: "#6B7280", marginBottom: 4 }}>Instagram URL</Text>
      <TextInput
        value={instagramUrl}
        onChangeText={onInstagramChange}
        placeholder="https://instagram.com/yourprofile"
        placeholderTextColor="#9CA3AF"
        style={{
          backgroundColor: "#F3F4F6",
          color: "#111827",
          padding: 12,
          borderRadius: 8,
        }}
      />
    </View>
  );
}
