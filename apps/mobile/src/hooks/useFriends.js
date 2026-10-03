import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useFriends(auth) {
  const queryClient = useQueryClient();

  const friendsQuery = useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      const res = await fetch("/api/friends?mode=friends");
      if (!res.ok) throw new Error("Failed to fetch friends");
      return res.json();
    },
    enabled: !!auth,
  });

  const pendingQuery = useQuery({
    queryKey: ["friend-requests-pending"],
    queryFn: async () => {
      const res = await fetch("/api/friends?mode=pending");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!auth,
  });

  const searchUsers = async (query) => {
    if (!query || query.length < 2) return [];
    const res = await fetch(
      `/api/friends?mode=search&q=${encodeURIComponent(query)}`,
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.users || [];
  };

  const sendRequest = useMutation({
    mutationFn: async (receiverId) => {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiver_id: receiverId }),
      });
      if (!res.ok) throw new Error("Failed to send request");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friend-requests-pending"] });
    },
  });

  const respondToRequest = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await fetch("/api/friends", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friend-requests-pending"] });
    },
  });

  const unfriend = useMutation({
    mutationFn: async (userId) => {
      const res = await fetch(`/api/friends?user_id=${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  return {
    friends: friendsQuery.data?.friends || [],
    pendingRequests: pendingQuery.data?.requests || [],
    friendsLoading: friendsQuery.isLoading,
    pendingLoading: pendingQuery.isLoading,
    searchUsers,
    sendRequest,
    respondToRequest,
    unfriend,
  };
}
