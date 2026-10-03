import { useState, useEffect } from "react";

export function useProfileData(user) {
  const [profile, setProfile] = useState(null);
  const [userTips, setUserTips] = useState([]);
  const [trips, setTrips] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProfileData = async () => {
    try {
      const [profileRes, tipsRes, tripsRes, followersRes, followingRes] =
        await Promise.all([
          fetch("/api/profile"),
          fetch("/api/tips"),
          fetch("/api/trips"),
          fetch("/api/follows?type=followers"),
          fetch("/api/follows?type=following"),
        ]);

      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile(data.profile);
      }
      if (tipsRes.ok) {
        const data = await tipsRes.json();
        setUserTips(data.tips.filter((tip) => tip.user_id === user?.id));
      }
      if (tripsRes.ok) {
        const data = await tripsRes.json();
        setTrips(data.trips || []);
      }
      if (followersRes.ok) {
        const data = await followersRes.json();
        setFollowers(data.users || []);
      }
      if (followingRes.ok) {
        const data = await followingRes.json();
        setFollowing(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfileData();
    } else {
      setLoading(false);
    }
  }, [user]);

  return {
    profile,
    userTips,
    trips,
    followers,
    following,
    loading,
    refetch: fetchProfileData,
  };
}
