import { useQuery } from "@tanstack/react-query";

export function useProfileData(auth) {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await fetch("/api/profile");
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      return response.json();
    },
    enabled: !!auth,
  });
}
