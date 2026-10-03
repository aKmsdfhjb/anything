import { useQuery } from "@tanstack/react-query";

export function useFriendSearch(user, searchQuery) {
  const { data: searchData } = useQuery({
    queryKey: ["friend-search", searchQuery],
    queryFn: async () => {
      const res = await fetch(
        `/api/friends?mode=search&q=${encodeURIComponent(searchQuery)}`,
      );
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!user && searchQuery.length >= 2,
  });

  return {
    searchResults: searchData?.users || [],
  };
}
