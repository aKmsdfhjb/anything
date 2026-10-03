import { useState, useEffect } from "react";
import { Alert } from "react-native";

export function useProfileForm(profileData) {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  useEffect(() => {
    if (profileData?.profile) {
      setUsername(profileData.profile.username || "");
      setBio(profileData.profile.bio || "");
      setProfileImageUrl(profileData.profile.profile_image || null);
      setFacebookUrl(profileData.profile.facebook_url || "");
      setTiktokUrl(profileData.profile.tiktok_url || "");
      setTwitterUrl(profileData.profile.twitter_url || "");
      setInstagramUrl(profileData.profile.instagram_url || "");
    }
  }, [profileData]);

  const updateProfile = async () => {
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, bio }),
      });

      if (!response.ok) throw new Error("Failed to update profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Could not update profile");
    }
  };

  const updateSocialLinks = async () => {
    try {
      const response = await fetch("/api/profile/social-links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facebook_url: facebookUrl || null,
          tiktok_url: tiktokUrl || null,
          twitter_url: twitterUrl || null,
          instagram_url: instagramUrl || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to update social links");
    } catch (error) {
      console.error("Error updating social links:", error);
      Alert.alert("Error", "Could not update social links");
    }
  };

  const createProfile = async (auth) => {
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username || auth?.user?.email?.split("@")[0] || "User",
          bio,
          profile_image: profileImageUrl,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create profile");
      }
    } catch (error) {
      console.error("Error creating profile:", error);
      Alert.alert("Error", error.message || "Could not create profile");
      throw error;
    }
  };

  return {
    username,
    setUsername,
    bio,
    setBio,
    facebookUrl,
    setFacebookUrl,
    tiktokUrl,
    setTiktokUrl,
    twitterUrl,
    setTwitterUrl,
    instagramUrl,
    setInstagramUrl,
    profileImageUrl,
    setProfileImageUrl,
    updateProfile,
    updateSocialLinks,
    createProfile,
  };
}
