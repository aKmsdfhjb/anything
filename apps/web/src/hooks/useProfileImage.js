import { useState, useCallback } from "react";

export function useProfileImage(profile, user, upload, onSuccess) {
  const [profileImageUrl, setProfileImageUrl] = useState(
    profile?.profile_image || null,
  );

  const handleImageUpload = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const { url, error } = await upload({ file });
      if (error) {
        alert(error);
        return;
      }
      setProfileImageUrl(url);
      try {
        if (!profile) {
          await fetch("/api/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: user?.email?.split("@")[0] || "User",
              profile_image: url,
            }),
          });
        } else {
          await fetch("/api/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profile_image: url }),
          });
        }
        if (onSuccess) onSuccess();
      } catch (err) {
        console.error("Error saving profile image:", err);
      }
    },
    [upload, profile, user, onSuccess],
  );

  return {
    profileImageUrl,
    handleImageUpload,
  };
}
