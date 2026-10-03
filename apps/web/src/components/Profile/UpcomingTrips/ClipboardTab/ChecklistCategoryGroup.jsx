"use client";

import { PACKING_CAT_EMOJI } from "../constants";
import { ChecklistItem } from "./ChecklistItem";

export function ChecklistCategoryGroup({
  category,
  items,
  onToggle,
  onDelete,
}) {
  return (
    <div>
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
        {PACKING_CAT_EMOJI[category] || "📦"} {category}
      </p>
      <div className="space-y-0.5">
        {items.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
