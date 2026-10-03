import { useState, useEffect } from "react";

export function useTripInvites(user) {
  const [invites, setInvites] = useState([]);
  const [respondingTo, setRespondingTo] = useState(null);

  useEffect(() => {
    if (user) {
      loadInvites();
    }
  }, [user]);

  const loadInvites = async () => {
    try {
      const response = await fetch("/api/trip-collaborators?mode=my_invites");
      if (!response.ok) throw new Error("Failed to load invites");
      const data = await response.json();
      const pendingInvites = (data.invites || []).filter(
        (inv) => inv.status === "pending",
      );
      setInvites(pendingInvites);
    } catch (error) {
      console.error("Error loading invites:", error);
    }
  };

  const respondToInvite = async (inviteId, status) => {
    setRespondingTo(inviteId);
    try {
      const response = await fetch("/api/trip-collaborators", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: inviteId, status }),
      });

      if (!response.ok) throw new Error("Failed to respond");

      await loadInvites();
      return { success: true, status };
    } catch (error) {
      console.error("Error responding to invite:", error);
      throw error;
    } finally {
      setRespondingTo(null);
    }
  };

  return {
    invites,
    respondingTo,
    loadInvites,
    respondToInvite,
  };
}
