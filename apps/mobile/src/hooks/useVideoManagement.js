import { useState, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";

export function useVideoManagement() {
  const [videoAsset, setVideoAsset] = useState(null);

  const pickVideo = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setVideoAsset(result.assets[0]);
    }
  }, []);

  return {
    videoAsset,
    pickVideo,
    setVideoAsset,
  };
}
