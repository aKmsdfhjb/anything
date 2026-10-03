"use client";

import { Plus } from "lucide-react";
import { useItinerary } from "@/hooks/useItinerary";
import { LoadingSpinner } from "../LoadingSpinner";
import { EmptyState } from "../EmptyState";
import { ItineraryAddForm } from "./ItineraryAddForm";
import { ItineraryDayGroup } from "./ItineraryDayGroup";

export function ItineraryTab({ trip }) {
  const {
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
  } = useItinerary(trip.id);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-black text-gray-900">Trip Itinerary</h4>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 text-[10px] font-bold text-[#008C8F] bg-[#008C8F]/5 px-2.5 py-1.5 rounded-lg hover:bg-[#008C8F]/10 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add
        </button>
      </div>

      {showAdd && (
        <ItineraryAddForm
          newItem={newItem}
          setNewItem={setNewItem}
          onCancel={() => setShowAdd(false)}
          onSubmit={() => newItem.title && addMutation.mutate(newItem)}
          isPending={addMutation.isPending}
        />
      )}

      {items.length === 0 ? (
        <EmptyState
          emoji="📋"
          title="No itinerary items yet"
          subtitle="Add activities for each day of your trip"
        />
      ) : (
        <div className="space-y-3">
          {dayNumbers.map((dayNum) => (
            <ItineraryDayGroup
              key={dayNum}
              dayNum={dayNum}
              items={grouped[dayNum]}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
