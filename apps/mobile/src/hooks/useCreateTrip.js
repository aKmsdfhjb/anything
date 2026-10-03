import { useState } from "react";

export function useCreateTrip() {
  const [selectedDestination, setSelectedDestination] = useState("");
  const [customDestination, setCustomDestination] = useState("");
  const [tripName, setTripName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState(null);

  const resetForm = () => {
    setTripName("");
    setStartDate("");
    setEndDate("");
    setNotes("");
    setDescription("");
    setSelectedDestination("");
    setCustomDestination("");
    setCoverImage(null);
  };

  const createTrip = async () => {
    if (!tripName || !startDate) {
      throw new Error("Please fill in trip name and start date");
    }
    if (!selectedDestination && !customDestination.trim()) {
      throw new Error("Please enter a destination");
    }

    try {
      const body = {
        trip_name: tripName,
        start_date: startDate,
        end_date: endDate || null,
        notes: notes || null,
        description: description || null,
        cover_image: coverImage || null,
        status: "planned",
      };

      if (selectedDestination) {
        body.destination_id = parseInt(selectedDestination);
      } else {
        body.custom_destination = customDestination.trim();
      }

      const response = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to create trip");
      }

      resetForm();
      return { success: true };
    } catch (error) {
      console.error("Error creating trip:", error);
      throw error;
    }
  };

  return {
    selectedDestination,
    setSelectedDestination,
    customDestination,
    setCustomDestination,
    tripName,
    setTripName,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    notes,
    setNotes,
    description,
    setDescription,
    coverImage,
    setCoverImage,
    createTrip,
    resetForm,
  };
}
