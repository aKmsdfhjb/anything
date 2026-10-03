import { useQuery } from "@tanstack/react-query";

export function useMapData(filterCategory) {
  const { data: mapData, isLoading } = useQuery({
    queryKey: ["map-points", filterCategory],
    queryFn: async () => {
      const url =
        filterCategory === "all"
          ? "/api/map-points"
          : `/api/map-points?category=${filterCategory}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load map data");
      return res.json();
    },
  });

  const destinations = mapData?.destinations || [];
  const venues = mapData?.venues || [];

  return { destinations, venues, isLoading };
}
