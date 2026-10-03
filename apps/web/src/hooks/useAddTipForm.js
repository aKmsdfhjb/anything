import { useState, useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAddTipForm() {
  const queryClient = useQueryClient();

  // Form state
  const [destinationId, setDestinationId] = useState("");
  const [destinationSearch, setDestinationSearch] = useState("");
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [venueType, setVenueType] = useState("");
  const [showVenueDropdown, setShowVenueDropdown] = useState(false);
  const [category, setCategory] = useState("recommend");
  const [bestTimeToVisit, setBestTimeToVisit] = useState("");
  const [specialTips, setSpecialTips] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationLatitude, setLocationLatitude] = useState(null);
  const [locationLongitude, setLocationLongitude] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [warningSeverity, setWarningSeverity] = useState("");
  const [showBestTimeDropdown, setShowBestTimeDropdown] = useState(false);

  // UI state
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Submit tip
  const submitMutation = useMutation({
    mutationFn: async (tipData) => {
      const res = await fetch("/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tipData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit tip");
      return data;
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["tips"] });
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = useCallback(() => {
    setError(null);

    if (!destinationId) {
      setError("Please select a destination");
      return;
    }
    if (!title.trim()) {
      setError("Please enter a name for the place or venue");
      return;
    }
    if (!venueType) {
      setError("Please select a venue type");
      return;
    }
    if (!content.trim()) {
      setError("Please describe what's good to know about this place");
      return;
    }
    if (!locationName.trim()) {
      setError("Please enter the address or area");
      return;
    }

    const tipData = {
      destination_id: parseInt(destinationId),
      title: title.trim(),
      content: content.trim(),
      tip_type: "text",
      photo_url: photos[0] || null,
      photo_urls: photos,
      category,
      venue_type: venueType,
      best_time_to_visit: bestTimeToVisit,
      special_tips: specialTips.trim() || null,
      location_name: locationName.trim() || null,
      location_latitude: locationLatitude,
      location_longitude: locationLongitude,
      warning_severity:
        category === "avoid" || category === "safety_warning"
          ? warningSeverity || "medium"
          : null,
    };

    submitMutation.mutate(tipData);
  }, [
    destinationId,
    title,
    venueType,
    content,
    locationName,
    photos,
    category,
    bestTimeToVisit,
    specialTips,
    locationLatitude,
    locationLongitude,
    warningSeverity,
    submitMutation,
  ]);

  const resetForm = useCallback(() => {
    setSubmitted(false);
    setTitle("");
    setContent("");
    setVenueType("");
    setCategory("recommend");
    setBestTimeToVisit("");
    setSpecialTips("");
    setLocationName("");
    setLocationLatitude(null);
    setLocationLongitude(null);
    setPhotos([]);
    setDestinationId("");
    setDestinationSearch("");
    setWarningSeverity("");
    setError(null);
  }, []);

  const removePhoto = useCallback((index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return {
    // Form state
    destinationId,
    setDestinationId,
    destinationSearch,
    setDestinationSearch,
    showDestinationDropdown,
    setShowDestinationDropdown,
    title,
    setTitle,
    content,
    setContent,
    venueType,
    setVenueType,
    showVenueDropdown,
    setShowVenueDropdown,
    category,
    setCategory,
    bestTimeToVisit,
    setBestTimeToVisit,
    specialTips,
    setSpecialTips,
    locationName,
    setLocationName,
    locationLatitude,
    setLocationLatitude,
    locationLongitude,
    setLocationLongitude,
    photos,
    setPhotos,
    warningSeverity,
    setWarningSeverity,
    showBestTimeDropdown,
    setShowBestTimeDropdown,
    // UI state
    error,
    setError,
    submitted,
    // Actions
    handleSubmit,
    resetForm,
    removePhoto,
    submitMutation,
  };
}
