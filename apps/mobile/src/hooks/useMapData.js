import { useQuery } from "@tanstack/react-query";

export function useMapData(activeFilter) {
  const { data: destinationsData, isLoading: destinationsLoading } = useQuery({
    queryKey: ["destinations"],
    queryFn: async () => {
      const response = await fetch("/api/destinations");
      if (!response.ok) throw new Error("Failed to fetch destinations");
      return response.json();
    },
  });

  const { data: mapPointsData, isLoading: mapPointsLoading } = useQuery({
    queryKey: ["map-points", activeFilter],
    queryFn: async () => {
      const response = await fetch(`/api/map-points?category=${activeFilter}`);
      if (!response.ok) throw new Error("Failed to fetch map points");
      return response.json();
    },
  });

  const destinations = destinationsData?.destinations || [];
  const mapPoints = mapPointsData?.tips || [];
  const destinationStats = mapPointsData?.destinationStats || [];
  const trendingDestinations = mapPointsData?.trendingDestinations || [];

  return {
    destinations,
    mapPoints,
    destinationStats,
    trendingDestinations,
    isLoading: destinationsLoading || mapPointsLoading,
  };
}
