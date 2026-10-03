import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useItinerary(tripId) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({
    title: "",
    day_number: 1,
    category: "activity",
    start_time: "",
    location_name: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["itinerary", tripId],
    queryFn: async () => {
      const res = await fetch(`/api/itinerary?trip_id=${tripId}`);
      if (!res.ok) throw new Error("Failed to fetch itinerary");
      return res.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async (item) => {
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, trip_id: tripId }),
      });
      if (!res.ok) throw new Error("Failed to add item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itinerary", tripId] });
      setShowAdd(false);
      setNewItem({
        title: "",
        day_number: 1,
        category: "activity",
        start_time: "",
        location_name: "",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/itinerary?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["itinerary", tripId] }),
  });

  const items = data?.items || [];

  const grouped = useMemo(() => {
    const map = {};
    items.forEach((item) => {
      const day = item.day_number;
      if (!map[day]) map[day] = [];
      map[day].push(item);
    });
    return map;
  }, [items]);

  const dayNumbers = Object.keys(grouped).sort((a, b) => Number(a) - Number(b));

  return {
    items,
    grouped,
    dayNumbers,
    isLoading,
    showAdd,
    setShowAdd,
    newItem,
    setNewItem,
    addMutation,
    deleteMutation,
  };
}
