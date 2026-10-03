import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useFriends(user) {
  const queryClient = useQueryClient();

  const { data: friendsData } = useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      const res = await fetch("/api/friends?mode=friends");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!user,
  });

  const { data: pendingData } = useQuery({
    queryKey: ["friend-requests-pending"],
    queryFn: async () => {
      const res = await fetch("/api/friends?mode=pending");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!user,
  });

  const sendRequestMutation = useMutation({
    mutationFn: async (receiverId) => {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiver_id: receiverId }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friend-search"] });
      queryClient.invalidateQueries({ queryKey: ["friend-requests-pending"] });
    },
  });

  const respondMutation = useMutation({
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

  const unfriendMutation = useMutation({
    mutationFn: async (userId) => {
      const res = await fetch(`/api/friends?user_id=${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["friends"] }),
  });

  return {
    friends: friendsData?.friends || [],
    pendingRequests: pendingData?.requests || [],
    sendRequest: sendRequestMutation.mutate,
    respondToRequest: respondMutation.mutate,
    unfriend: unfriendMutation.mutate,
    isSendingRequest: sendRequestMutation.isPending,
  };
}
