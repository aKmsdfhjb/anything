import { useCallback } from "react";
import { Alert, Linking } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateTip() {
  const queryClient = useQueryClient();

  const createTipMutation = useMutation({
    mutationFn: async (tipData) => {
      const response = await fetch("/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tipData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create tip");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tips"] });
      return data;
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const showShareOptions = useCallback(
    (tip, selectedDestination, locationName) => {
      const message = `Check out my travel tip: ${tip.title}\n\n${selectedDestination?.name ? `📍 ${selectedDestination.name}` : ""}${locationName ? `\nPosted from: ${locationName}` : ""}\n\nShared on Tip Trip! 🌍✈️`;

      Alert.alert(
        "Share on Social Media",
        "Tag yourself and share your travel tip!",
        [
          {
            text: "TikTok",
            onPress: () => {
              Linking.openURL("tiktok://").catch(() => {
                Alert.alert("TikTok", "Please install TikTok to share!");
              });
            },
          },
          {
            text: "Instagram",
            onPress: () => {
              Linking.openURL("instagram://").catch(() => {
                Alert.alert("Instagram", "Please install Instagram to share!");
              });
            },
          },
          {
            text: "Facebook",
            onPress: () => {
              const fbUrl = `fb://facewebmodal/f?href=https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://tiptripapp.com")}&quote=${encodeURIComponent(message)}`;
              Linking.openURL(fbUrl).catch(() => {
                Linking.openURL(
                  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://tiptripapp.com")}&quote=${encodeURIComponent(message)}`,
                );
              });
            },
          },
          {
            text: "Twitter",
            onPress: () => {
              const twitterUrl = `twitter://post?message=${encodeURIComponent(message)}`;
              Linking.openURL(twitterUrl).catch(() => {
                Linking.openURL(
                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
                );
              });
            },
          },
          { text: "Cancel", style: "cancel" },
        ],
      );
    },
    [],
  );

  return {
    createTipMutation,
    showShareOptions,
  };
}
