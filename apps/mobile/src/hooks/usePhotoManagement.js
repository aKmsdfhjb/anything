import { useState, useCallback } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

const MAX_PHOTOS = 5;

export function usePhotoManagement(getCurrentLocation) {
  const [photoAssets, setPhotoAssets] = useState([]);

  const addPhoto = useCallback(
    async (fromCamera = false) => {
      if (photoAssets.length >= MAX_PHOTOS) {
        Alert.alert(
          "Photo Limit Reached",
          `You can add up to ${MAX_PHOTOS} photos per tip. Remove one to add another!`,
        );
        return;
      }

      let result;
      if (fromCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission needed",
            "Please allow camera access to take photos",
          );
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          quality: 1,
        });

        if (getCurrentLocation) {
          getCurrentLocation();
        }
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
        });
      }

      if (!result.canceled) {
        setPhotoAssets([...photoAssets, result.assets[0]]);
      }
    },
    [photoAssets, getCurrentLocation],
  );

  const removePhoto = useCallback(
    (index) => {
      const newPhotos = photoAssets.filter((_, i) => i !== index);
      setPhotoAssets(newPhotos);
    },
    [photoAssets],
  );

  return {
    photoAssets,
    addPhoto,
    removePhoto,
    setPhotoAssets,
    MAX_PHOTOS,
  };
}
