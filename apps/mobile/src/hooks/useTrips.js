import { useState, useEffect } from "react";

export function useTrips(user, filters) {
  const [trips, setTrips] = useState([]);
  const [allTrips, setAllTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTrips();
    }
  }, [user]);

  // React to filter changes
  useEffect(() => {
    if (allTrips.length > 0) {
      setTrips(applyClientFilters(allTrips));
    }
  }, [filters, allTrips]);

  const loadTrips = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status !== "all") {
        params.append("status", filters.status);
      }
      const response = await fetch(`/api/trips?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to load trips");
      const data = await response.json();
      const fetchedTrips = data.trips || [];
      setAllTrips(fetchedTrips);
      // Initial filtering will happen via the useEffect above
    } catch (error) {
      console.error("Error loading trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyClientFilters = (tripsData) => {
    return tripsData.filter((trip) => {
      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchableText = [
          trip.trip_name,
          trip.destination_name,
          trip.country,
          trip.notes,
        ]
          .join(" ")
          .toLowerCase();
        if (!searchableText.includes(query)) return false;
      }

      // Timeframe filter
      if (filters.timeframe !== "all") {
        const now = new Date();
        const startDate = new Date(trip.start_date);
        const endDate = trip.end_date ? new Date(trip.end_date) : startDate;

        switch (filters.timeframe) {
          case "upcoming":
            if (startDate <= now) return false;
            break;
          case "past":
            if (endDate > now) return false;
            break;
          case "this-month":
            const thisMonth = now.getMonth();
            const thisYear = now.getFullYear();
            if (
              startDate.getMonth() !== thisMonth ||
              startDate.getFullYear() !== thisYear
            )
              return false;
            break;
          case "this-year":
            if (startDate.getFullYear() !== now.getFullYear()) return false;
            break;
        }
      }

      // Destination filter
      if (
        filters.destination &&
        !trip.destination_name
          .toLowerCase()
          .includes(filters.destination.toLowerCase())
      ) {
        return false;
      }

      // Ownership filter
      if (filters.ownership !== "all") {
        if (filters.ownership === "own" && trip.is_collaborator) return false;
        if (filters.ownership === "shared" && !trip.is_collaborator)
          return false;
      }

      return true;
    });
  };

  const applyFilters = () => {
    setTrips(applyClientFilters(allTrips));
  };

  const deleteTrip = async (tripId) => {
    try {
      const response = await fetch(`/api/trips?id=${tripId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete trip");
      await loadTrips();
    } catch (error) {
      console.error("Error deleting trip:", error);
      throw error;
    }
  };

  return {
    trips,
    allTrips,
    loading,
    loadTrips,
    applyFilters,
    deleteTrip,
  };
}
