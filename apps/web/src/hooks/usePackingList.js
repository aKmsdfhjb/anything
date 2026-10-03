import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function usePackingList(tripId) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("clothing");

  const { data, isLoading } = useQuery({
    queryKey: ["packing-list", tripId],
    queryFn: async () => {
      const res = await fetch(`/api/packing-list?trip_id=${tripId}`);
      if (!res.ok) throw new Error("Failed to fetch packing list");
      return res.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async (item) => {
      const res = await fetch("/api/packing-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error("Failed to add item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packing-list", tripId] });
      setNewItemName("");
      setShowAdd(false);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_packed }) => {
      const res = await fetch("/api/packing-list", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_packed }),
      });
      if (!res.ok) throw new Error("Failed to update item");
      return res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["packing-list", tripId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/packing-list?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["packing-list", tripId] }),
  });

  const items = data?.items || [];
  const packedCount = items.filter((i) => i.is_packed).length;
  const totalCount = items.length;

  const grouped = useMemo(() => {
    const map = {};
    items.forEach((item) => {
      const cat = item.category;
      if (!map[cat]) map[cat] = [];
      map[cat].push(item);
    });
    return map;
  }, [items]);

  return {
    items,
    grouped,
    packedCount,
    totalCount,
    isLoading,
    showAdd,
    setShowAdd,
    newItemName,
    setNewItemName,
    newItemCategory,
    setNewItemCategory,
    addMutation,
    toggleMutation,
    deleteMutation,
  };
}
