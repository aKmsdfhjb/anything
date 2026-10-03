"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import useUser from "@/utils/useUser";
import useUpload from "@/utils/useUpload";
import { Star, Lightbulb } from "lucide-react";
import { useAddTipForm } from "@/hooks/useAddTipForm";
import { SuccessScreen } from "@/components/AddTip/SuccessScreen";
import { UnauthenticatedView } from "@/components/AddTip/UnauthenticatedView";
import { LoadingView } from "@/components/AddTip/LoadingView";
import { FormHeader } from "@/components/AddTip/FormHeader";
import { ErrorBanner } from "@/components/AddTip/ErrorBanner";
import { ModerationInfo } from "@/components/AddTip/ModerationInfo";
import { TipCategorySelector } from "@/components/AddTip/TipCategorySelector";
import { WarningSeveritySelector } from "@/components/AddTip/WarningSeveritySelector";
import { DestinationSelector } from "@/components/AddTip/DestinationSelector";
import { TextInput } from "@/components/AddTip/TextInput";
import { VenueTypeSelector } from "@/components/AddTip/VenueTypeSelector";
import { MapLocationPicker } from "@/components/AddTip/MapLocationPicker";
import { TextAreaInput } from "@/components/AddTip/TextAreaInput";
import { BestTimeSelector } from "@/components/AddTip/BestTimeSelector";
import { PhotoUpload } from "@/components/AddTip/PhotoUpload";
import { SubmitButton } from "@/components/AddTip/SubmitButton";

export default function AddTipPage() {
  const { data: user, loading: userLoading } = useUser();
  const [upload, { loading: uploadLoading }] = useUpload();
  const fileInputRef = useRef(null);
  const destDropdownRef = useRef(null);
  const venueDropdownRef = useRef(null);
  const timeDropdownRef = useRef(null);

  const formState = useAddTipForm();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        destDropdownRef.current &&
        !destDropdownRef.current.contains(e.target)
      ) {
        formState.setShowDestinationDropdown(false);
      }
      if (
        venueDropdownRef.current &&
        !venueDropdownRef.current.contains(e.target)
      ) {
        formState.setShowVenueDropdown(false);
      }
      if (
        timeDropdownRef.current &&
        !timeDropdownRef.current.contains(e.target)
      ) {
        formState.setShowBestTimeDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [formState]);

  // Fetch destinations
  const { data: destinationsData } = useQuery({
    queryKey: ["destinations"],
    queryFn: async () => {
      const res = await fetch("/api/destinations");
      if (!res.ok) throw new Error("Failed to fetch destinations");
      return res.json();
    },
  });

  const destinations = destinationsData?.destinations || [];

  // Find the selected destination for map centering
  const selectedDestination = destinations.find(
    (d) => d.id === parseInt(formState.destinationId),
  );

  // Photo upload
  const handlePhotoUpload = useCallback(
    async (e) => {
      const files = Array.from(e.target.files);
      if (formState.photos.length + files.length > 5) {
        formState.setError("You can upload up to 5 photos");
        return;
      }

      for (const file of files) {
        const result = await upload({ file });
        if (result.error) {
          formState.setError(result.error);
          return;
        }
        formState.setPhotos((prev) => [...prev, result.url]);
      }
      formState.setError(null);
    },
    [upload, formState],
  );

  // Success screen
  if (formState.submitted) {
    return <SuccessScreen onAddAnother={formState.resetForm} />;
  }

  // Not logged in
  if (!userLoading && !user) {
    return <UnauthenticatedView />;
  }

  if (userLoading) {
    return <LoadingView />;
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] pb-20">
      <FormHeader />

      <div className="max-w-3xl mx-auto px-5 md:px-8 mt-8">
        <ErrorBanner
          error={formState.error}
          onDismiss={() => formState.setError(null)}
        />

        <ModerationInfo />

        <TipCategorySelector
          category={formState.category}
          onChange={formState.setCategory}
        />

        <WarningSeveritySelector
          severity={formState.warningSeverity}
          onChange={formState.setWarningSeverity}
          category={formState.category}
        />

        <DestinationSelector
          destinationId={formState.destinationId}
          destinationSearch={formState.destinationSearch}
          onSearchChange={(value) => {
            formState.setDestinationSearch(value);
            formState.setShowDestinationDropdown(true);
          }}
          onDestinationSelect={(dest) => {
            formState.setDestinationId(String(dest.id));
            formState.setDestinationSearch(dest.name);
            formState.setShowDestinationDropdown(false);
          }}
          onDestinationClear={() => {
            formState.setDestinationId("");
            formState.setDestinationSearch("");
          }}
          destinations={destinations}
          showDropdown={formState.showDestinationDropdown}
          onFocus={() => formState.setShowDestinationDropdown(true)}
          dropdownRef={destDropdownRef}
        />

        <TextInput
          label="Name of Place or Venue"
          icon={Star}
          iconColor="#F59E0B"
          value={formState.title}
          onChange={formState.setTitle}
          placeholder="e.g. The Blue Lagoon, Ramen Street, Santorini Sunset Bar..."
          maxLength={150}
          required
        />

        <VenueTypeSelector
          venueType={formState.venueType}
          onChange={formState.setVenueType}
          showDropdown={formState.showVenueDropdown}
          onToggleDropdown={() =>
            formState.setShowVenueDropdown(!formState.showVenueDropdown)
          }
          dropdownRef={venueDropdownRef}
        />

        <MapLocationPicker
          locationName={formState.locationName}
          locationLatitude={formState.locationLatitude}
          locationLongitude={formState.locationLongitude}
          onLocationChange={(name) => formState.setLocationName(name)}
          onCoordinatesChange={(lat, lng) => {
            formState.setLocationLatitude(lat);
            formState.setLocationLongitude(lng);
          }}
          destinationLat={selectedDestination?.latitude}
          destinationLng={selectedDestination?.longitude}
          destinationName={selectedDestination?.name}
        />

        <TextAreaInput
          label="What's Good to Know"
          icon={Lightbulb}
          iconColor="#F59E0B"
          value={formState.content}
          onChange={formState.setContent}
          placeholder="Share your experience — what makes this place special? What should other travelers know before visiting? Describe the atmosphere, prices, quality..."
          rows={5}
          maxLength={2000}
          required
        />

        <BestTimeSelector
          bestTimeToVisit={formState.bestTimeToVisit}
          onChange={formState.setBestTimeToVisit}
          showDropdown={formState.showBestTimeDropdown}
          onToggleDropdown={() =>
            formState.setShowBestTimeDropdown(!formState.showBestTimeDropdown)
          }
          dropdownRef={timeDropdownRef}
        />

        <TextAreaInput
          label="Insider Tips & Special Advice"
          icon={Lightbulb}
          iconColor="#8B5CF6"
          value={formState.specialTips}
          onChange={formState.setSpecialTips}
          placeholder="Any insider knowledge? Hidden menu items, secret entrances, money-saving hacks, things to watch out for, local customs to respect..."
          rows={4}
          maxLength={1500}
          optional
        />

        <PhotoUpload
          photos={formState.photos}
          onPhotoUpload={handlePhotoUpload}
          onRemovePhoto={formState.removePhoto}
          uploadLoading={uploadLoading}
          fileInputRef={fileInputRef}
        />

        <SubmitButton
          onSubmit={formState.handleSubmit}
          isSubmitting={formState.submitMutation.isPending}
          disabled={uploadLoading}
        />
      </div>
    </div>
  );
}
