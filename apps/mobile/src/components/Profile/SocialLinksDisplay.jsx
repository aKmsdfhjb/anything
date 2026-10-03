import { View, Text, TouchableOpacity, Linking, Alert } from "react-native";
import { Facebook, Twitter, Instagram } from "lucide-react-native";

export function SocialLinksDisplay({ profile }) {
  const openSocialLink = (url, platform) => {
    if (!url) {
      Alert.alert("No Link", `No ${platform} profile linked`);
      return;
    }
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", `Could not open ${platform} link`);
    });
  };

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
      {profile?.facebook_url && (
        <TouchableOpacity
          onPress={() => openSocialLink(profile.facebook_url, "Facebook")}
          style={{
            backgroundColor: "#1877F2",
            padding: 12,
            borderRadius: 12,
            alignItems: "center",
            width: "47%",
          }}
        >
          <Facebook size={24} color="#fff" />
          <Text style={{ color: "#fff", marginTop: 4, fontSize: 12 }}>
            Facebook
          </Text>
        </TouchableOpacity>
      )}
      {profile?.tiktok_url && (
        <TouchableOpacity
          onPress={() => openSocialLink(profile.tiktok_url, "TikTok")}
          style={{
            backgroundColor: "#000",
            borderWidth: 1,
            borderColor: "#E5E7EB",
            padding: 12,
            borderRadius: 12,
            alignItems: "center",
            width: "47%",
          }}
        >
          <Text style={{ fontSize: 24 }}>♫</Text>
          <Text style={{ color: "#fff", marginTop: 4, fontSize: 12 }}>
            TikTok
          </Text>
        </TouchableOpacity>
      )}
      {profile?.twitter_url && (
        <TouchableOpacity
          onPress={() => openSocialLink(profile.twitter_url, "Twitter")}
          style={{
            backgroundColor: "#1DA1F2",
            padding: 12,
            borderRadius: 12,
            alignItems: "center",
            width: "47%",
          }}
        >
          <Twitter size={24} color="#fff" />
          <Text style={{ color: "#fff", marginTop: 4, fontSize: 12 }}>
            Twitter
          </Text>
        </TouchableOpacity>
      )}
      {profile?.instagram_url && (
        <TouchableOpacity
          onPress={() => openSocialLink(profile.instagram_url, "Instagram")}
          style={{
            backgroundColor: "#E1306C",
            padding: 12,
            borderRadius: 12,
            alignItems: "center",
            width: "47%",
          }}
        >
          <Instagram size={24} color="#fff" />
          <Text style={{ color: "#fff", marginTop: 4, fontSize: 12 }}>
            Instagram
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
