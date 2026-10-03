import { useQuery } from "@tanstack/react-query";

export function useUserTips(auth) {
  return useQuery({
    queryKey: ["user-tips"],
    queryFn: async () => {
      const response = await fetch("/api/tips");
      if (!response.ok) {
        throw new Error("Failed to fetch tips");
      }
      const data = await response.json();
      return {
        tips: data.tips.filter((tip) => tip.user_id === auth?.user?.id),
      };
    },
    enabled: !!auth,
  });
}
