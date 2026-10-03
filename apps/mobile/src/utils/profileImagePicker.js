import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export async function pickAndUploadProfileImage({
  upload,
  setProfileImageUrl,
  profileData,
  username,
  auth,
  refetchProfile,
}) {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled && result.assets[0]) {
    const { url, error } = await upload({
      reactNativeAsset: result.assets[0],
    });
    if (error) {
      Alert.alert("Upload Error", error);
      return;
    }
    setProfileImageUrl(url);

    try {
      const currentProfile = profileData?.profile;
      if (!currentProfile) {
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: username || auth?.user?.email?.split("@")[0] || "User",
            profile_image: url,
          }),
        });
        if (!res.ok) throw new Error("Failed to create profile");
      } else {
        const res = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile_image: url }),
        });
        if (!res.ok) throw new Error("Failed to save photo");
      }
      refetchProfile();
    } catch (err) {
      console.error("Error saving profile image:", err);
      Alert.alert("Error", "Photo uploaded but couldn't save to your profile");
    }
  }
}
