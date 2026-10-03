import { useState, useEffect } from "react";

export function useDestinations(user) {
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    if (user) {
      loadDestinations();
    }
  }, [user]);

  const loadDestinations = async () => {
    try {
      const response = await fetch("/api/destinations");
      if (!response.ok) throw new Error("Failed to load destinations");
      const data = await response.json();
      setDestinations(data.destinations || []);
    } catch (error) {
      console.error("Error loading destinations:", error);
    }
  };

  return { destinations, loadDestinations };
}
