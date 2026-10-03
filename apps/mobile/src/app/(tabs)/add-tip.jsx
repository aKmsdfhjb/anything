import { useState, useCallback, useEffect } from "react";
import { View, ScrollView, Alert, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/utils/auth/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import useUpload from "@/utils/useUpload";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import { useLocation } from "@/hooks/useLocation";
import { usePhotoManagement } from "@/hooks/usePhotoManagement";
import { useVideoManagement } from "@/hooks/useVideoManagement";
import { useCreateTip } from "@/hooks/useCreateTip";
import { Header } from "@/components/AddTip/Header";
import { UnauthenticatedView } from "@/components/AddTip/UnauthenticatedView";
import { MapLocationPicker } from "@/components/AddTip/MapLocationPicker";
import { PhotoGrid } from "@/components/AddTip/PhotoGrid";
import { TipTypeSelector } from "@/components/AddTip/TipTypeSelector";
import { DestinationSelector } from "@/components/AddTip/DestinationSelector";
import { TitleInput } from "@/components/AddTip/TitleInput";
import { ContentInput } from "@/components/AddTip/ContentInput";
import { VideoSelector } from "@/components/AddTip/VideoSelector";
import { SubmitButton } from "@/components/AddTip/SubmitButton";

export default function AddTipScreen() {
  const insets = useSafeAreaInsets();
  const { auth, signIn, isReady } = useAuth();
  const [upload, { loading: uploading }] = useUpload();
  const params = useLocalSearchParams();

  const [tipType, setTipType] = useState("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [showDestinations, setShowDestinations] = useState(false);
  const [pinnedLocation, setPinnedLocation] = useState(null);
  const [pinnedLocationName, setPinnedLocationName] = useState("");

  // Pre-fill location from route params (from explore map dropped pin)
  useEffect(() => {
    if (params.latitude && params.longitude) {
      const lat = parseFloat(params.latitude);
      const lng = parseFloat(params.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        setPinnedLocation({ latitude: lat, longitude: lng });
        if (params.locationName) {
          setPinnedLocationName(params.locationName);
        }
      }
    }
  }, [params.latitude, params.longitude, params.locationName]);

  const { location, locationName, gettingLocation, getCurrentLocation } =
    useLocation(auth);
  const { photoAssets, addPhoto, removePhoto, setPhotoAssets, MAX_PHOTOS } =
    usePhotoManagement(getCurrentLocation);
  const { videoAsset, pickVideo, setVideoAsset } = useVideoManagement();
  const { createTipMutation, showShareOptions } = useCreateTip();

  const { data: destinationsData } = useQuery({
    queryKey: ["destinations"],
    queryFn: async () => {
      const response = await fetch("/api/destinations");
      if (!response.ok) {
        throw new Error("Failed to fetch destinations");
      }
      return response.json();
    },
  });

  // Handle location change from map picker
  const handleLocationChange = useCallback((coords, name) => {
    setPinnedLocation(coords);
    setPinnedLocationName(name || "");
  }, []);

  // Use pinned location if available, otherwise fall back to auto-detected location
  const finalLocation = pinnedLocation || location;
  const finalLocationName = pinnedLocation ? pinnedLocationName : locationName;

  const handleSubmit = useCallback(async () => {
    if (!auth) {
      signIn();
      return;
    }

    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    if (!selectedDestination) {
      Alert.alert("Error", "Please select a destination");
      return;
    }

    if (tipType === "text" && !content.trim()) {
      Alert.alert("Error", "Please enter your tip content");
      return;
    }

    if (tipType === "video" && !videoAsset) {
      Alert.alert("Error", "Please select a video");
      return;
    }

    let videoUrl = null;
    const photoUrls = [];

    if (tipType === "video" && videoAsset) {
      const uploadResult = await upload({ reactNativeAsset: videoAsset });
      if (uploadResult.error) {
        Alert.alert("Error", "Failed to upload video");
        return;
      }
      videoUrl = uploadResult.url;
    }

    if (photoAssets.length > 0) {
      for (const photo of photoAssets) {
        const uploadResult = await upload({ reactNativeAsset: photo });
        if (uploadResult.error) {
          Alert.alert("Error", "Failed to upload photos");
          return;
        }
        photoUrls.push(uploadResult.url);
      }
    }

    createTipMutation.mutate(
      {
        destination_id: selectedDestination.id,
        title: title.trim(),
        content: tipType === "text" ? content.trim() : null,
        video_url: videoUrl,
        photo_url: photoUrls[0] || null,
        photo_urls: photoUrls.length > 0 ? JSON.stringify(photoUrls) : null,
        tip_type: tipType,
        location_latitude: finalLocation?.latitude,
        location_longitude: finalLocation?.longitude,
        location_name: finalLocationName || null,
      },
      {
        onSuccess: (data) => {
          const newTip = data.tip;

          setTitle("");
          setContent("");
          setSelectedDestination(null);
          setVideoAsset(null);
          setPhotoAssets([]);
          setPinnedLocation(null);
          setPinnedLocationName("");

          Alert.alert(
            "Success! 🎉",
            "Your tip has been shared! Want to tag it on social media?",
            [
              { text: "Not Now", style: "cancel" },
              {
                text: "Share",
                onPress: () =>
                  showShareOptions(
                    newTip,
                    selectedDestination,
                    finalLocationName,
                  ),
              },
            ],
          );
        },
      },
    );
  }, [
    auth,
    signIn,
    title,
    selectedDestination,
    tipType,
    content,
    videoAsset,
    photoAssets,
    finalLocation,
    finalLocationName,
    upload,
    createTipMutation,
    showShareOptions,
    setPhotoAssets,
    setVideoAsset,
  ]);

  const destinations = destinationsData?.destinations || [];

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F8FAFC",
        }}
      >
        <ActivityIndicator size="large" color="#008C8F" />
      </View>
    );
  }

  if (!auth) {
    return <UnauthenticatedView insets={insets} onSignIn={signIn} />;
  }

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
      <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
        <StatusBar style="light" />

        <Header
          insets={insets}
          location={finalLocation}
          locationName={finalLocationName}
        />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: insets.bottom + 100,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <MapLocationPicker
            location={finalLocation}
            locationName={finalLocationName}
            onLocationChange={handleLocationChange}
            destinationLat={selectedDestination?.latitude}
            destinationLng={selectedDestination?.longitude}
            destinationName={selectedDestination?.name}
          />

          <PhotoGrid
            photoAssets={photoAssets}
            maxPhotos={MAX_PHOTOS}
            onAddPhoto={addPhoto}
            onRemovePhoto={removePhoto}
          />

          <TipTypeSelector tipType={tipType} onTypeChange={setTipType} />

          <DestinationSelector
            selectedDestination={selectedDestination}
            destinations={destinations}
            showDestinations={showDestinations}
            onToggle={() => setShowDestinations(!showDestinations)}
            onSelect={(dest) => {
              setSelectedDestination(dest);
              setShowDestinations(false);
            }}
          />

          <TitleInput value={title} onChangeText={setTitle} />

          {tipType === "text" ? (
            <ContentInput value={content} onChangeText={setContent} />
          ) : (
            <VideoSelector videoAsset={videoAsset} onPickVideo={pickVideo} />
          )}

          <SubmitButton
            onSubmit={handleSubmit}
            isLoading={createTipMutation.isPending || uploading}
            disabled={createTipMutation.isPending || uploading}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
