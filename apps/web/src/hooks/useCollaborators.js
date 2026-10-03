import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useCollaborators(tripId) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const { data: collabData, isLoading } = useQuery({
    queryKey: ["trip-collaborators", tripId],
    queryFn: async () => {
      const res = await fetch(`/api/trip-collaborators?trip_id=${tripId}`);
      if (!res.ok) throw new Error("Failed to fetch collaborators");
      return res.json();
    },
  });

  const { data: searchData } = useQuery({
    queryKey: ["search-users", searchQuery],
    queryFn: async () => {
      const res = await fetch(
        `/api/trip-collaborators?mode=search_users&q=${encodeURIComponent(searchQuery)}`,
      );
      if (!res.ok) throw new Error("Failed to search");
      return res.json();
    },
    enabled: searchQuery.length >= 2,
  });

  const inviteMutation = useMutation({
    mutationFn: async (userId) => {
      const res = await fetch("/api/trip-collaborators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trip_id: tripId, user_id: userId }),
      });
      if (!res.ok) throw new Error("Failed to invite");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["trip-collaborators", tripId],
      });
      setSearchQuery("");
      setShowSearch(false);
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (collabId) => {
      const res = await fetch(
        `/api/trip-collaborators?id=${collabId}&trip_id=${tripId}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error("Failed to remove");
      return res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["trip-collaborators", tripId],
      }),
  });

  const owner = collabData?.owner;
  const collaborators = collabData?.collaborators || [];
  const searchResults = searchData?.users || [];
  const existingUserIds = new Set(collaborators.map((c) => c.user_id));

  return {
    owner,
    collaborators,
    searchResults,
    existingUserIds,
    isLoading,
    searchQuery,
    setSearchQuery,
    showSearch,
    setShowSearch,
    inviteMutation,
    removeMutation,
  };
}
