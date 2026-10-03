import { useState, useEffect } from "react";

export function useFollowCounts(auth) {
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    if (!auth) return;

    const loadFollowCounts = async () => {
      try {
        const [followersRes, followingRes] = await Promise.all([
          fetch("/api/follows?type=followers"),
          fetch("/api/follows?type=following"),
        ]);

        if (followersRes.ok) {
          const data = await followersRes.json();
          setFollowers(data.users || []);
        }

        if (followingRes.ok) {
          const data = await followingRes.json();
          setFollowing(data.users || []);
        }
      } catch (error) {
        console.error("Error loading follow counts:", error);
      }
    };

    loadFollowCounts();
  }, [auth]);

  return { followers, following };
}
