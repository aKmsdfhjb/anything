import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

export function useAffiliateBooking(destinationName, country) {
  const { data, isLoading } = useQuery({
    queryKey: ["affiliate-links", destinationName, country],
    queryFn: async () => {
      const res = await fetch(
        `/api/affiliates/links?destination=${encodeURIComponent(destinationName || "")}&country=${encodeURIComponent(country || "")}`,
      );
      if (!res.ok) throw new Error("Failed to fetch links");
      return res.json();
    },
  });

  const links = data?.links || [];

  const grouped = useMemo(() => {
    const map = {};
    links.forEach((link) => {
      if (!map[link.category]) map[link.category] = [];
      map[link.category].push(link);
    });
    return map;
  }, [links]);

  return {
    links,
    grouped,
    isLoading,
  };
}
