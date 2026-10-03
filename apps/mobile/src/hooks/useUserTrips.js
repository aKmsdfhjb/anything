import { useQuery } from "@tanstack/react-query";

export function useUserTrips(auth) {
  return useQuery({
    queryKey: ["user-trips"],
    queryFn: async () => {
      const response = await fetch("/api/trips?status=planned");
      if (!response.ok) {
        throw new Error("Failed to fetch trips");
      }
      return response.json();
    },
    enabled: !!auth,
  });
}
