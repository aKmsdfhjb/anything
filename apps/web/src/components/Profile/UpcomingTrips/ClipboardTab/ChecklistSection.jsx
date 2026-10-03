"use client";

import { Plus } from "lucide-react";
import { usePackingList } from "@/hooks/usePackingList";
import { LoadingSpinner } from "../LoadingSpinner";
import { EmptyState } from "../EmptyState";
import { ChecklistAddForm } from "./ChecklistAddForm";
import { ChecklistProgress } from "./ChecklistProgress";
import { ChecklistCategoryGroup } from "./ChecklistCategoryGroup";

export function ChecklistSection({ trip }) {
  const {
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
  } = usePackingList(trip.id);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-black text-gray-900">Trip Checklist</h4>
          {totalCount > 0 && (
            <p className="text-[10px] text-gray-400 font-semibold">
              {packedCount}/{totalCount} packed
            </p>
          )}
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 text-[10px] font-bold text-[#008C8F] bg-[#008C8F]/5 px-2.5 py-1.5 rounded-lg hover:bg-[#008C8F]/10 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add
        </button>
      </div>

      {totalCount > 0 && (
        <ChecklistProgress packedCount={packedCount} totalCount={totalCount} />
      )}

      {showAdd && (
        <ChecklistAddForm
          itemName={newItemName}
          setItemName={setNewItemName}
          category={newItemCategory}
          setCategory={setNewItemCategory}
          onSubmit={() =>
            newItemName &&
            addMutation.mutate({
              trip_id: trip.id,
              item_name: newItemName,
              category: newItemCategory,
            })
          }
          isPending={addMutation.isPending}
        />
      )}

      {totalCount === 0 ? (
        <EmptyState
          emoji="✅"
          title="No checklist items yet"
          subtitle="Add items you need for your trip"
        />
      ) : (
        <div className="space-y-3">
          {Object.keys(grouped)
            .sort()
            .map((cat) => (
              <ChecklistCategoryGroup
                key={cat}
                category={cat}
                items={grouped[cat]}
                onToggle={(id, isPacked) =>
                  toggleMutation.mutate({ id, is_packed: isPacked })
                }
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
        </div>
      )}
    </div>
  );
}
