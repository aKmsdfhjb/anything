import { useState, useCallback, useRef } from "react";

export function useLocationSearch() {
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationSearchLoading, setLocationSearchLoading] = useState(false);
  const locationSearchTimer = useRef(null);

  const handleLocationSearch = useCallback((query) => {
    setLocationSearchQuery(query);

    if (locationSearchTimer.current) {
      clearTimeout(locationSearchTimer.current);
    }

    if (query.length < 2) {
      setLocationSuggestions([]);
      setShowLocationDropdown(false);
      return;
    }

    setLocationSearchLoading(true);
    locationSearchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/places-search?input=${encodeURIComponent(query)}`,
        );
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setLocationSuggestions(data.predictions || []);
        setShowLocationDropdown(true);
      } catch (err) {
        console.error("Location search error:", err);
        setLocationSuggestions([]);
      } finally {
        setLocationSearchLoading(false);
      }
    }, 300);
  }, []);

  const handleSelectLocation = useCallback(async (prediction, onSelect) => {
    setLocationSearchQuery(prediction.description);
    setShowLocationDropdown(false);
    setLocationSuggestions([]);

    // Get lat/lng from place details
    try {
      const res = await fetch("/api/places-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ place_id: prediction.place_id }),
      });
      if (res.ok) {
        const details = await res.json();
        if (onSelect) {
          onSelect({
            name: prediction.description,
            latitude: details.latitude,
            longitude: details.longitude,
          });
        }
      }
    } catch (err) {
      console.error("Error getting place details:", err);
    }
  }, []);

  return {
    locationSearchQuery,
    setLocationSearchQuery,
    locationSuggestions,
    showLocationDropdown,
    setShowLocationDropdown,
    locationSearchLoading,
    handleLocationSearch,
    handleSelectLocation,
  };
}
