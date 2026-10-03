import { useState, useCallback } from "react";

export function useProfileForm(profile, onSuccess) {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [facebookUrl, setFacebookUrl] = useState(profile?.facebook_url || "");
  const [tiktokUrl, setTiktokUrl] = useState(profile?.tiktok_url || "");
  const [twitterUrl, setTwitterUrl] = useState(profile?.twitter_url || "");
  const [instagramUrl, setInstagramUrl] = useState(
    profile?.instagram_url || "",
  );

  const handleSave = useCallback(async () => {
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, bio }),
      });
      await fetch("/api/profile/social-links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facebook_url: facebookUrl || null,
          tiktok_url: tiktokUrl || null,
          twitter_url: twitterUrl || null,
          instagram_url: instagramUrl || null,
        }),
      });
      setIsEditing(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  }, [
    username,
    bio,
    facebookUrl,
    tiktokUrl,
    twitterUrl,
    instagramUrl,
    onSuccess,
  ]);

  return {
    isEditing,
    setIsEditing,
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
    handleSave,
  };
}
