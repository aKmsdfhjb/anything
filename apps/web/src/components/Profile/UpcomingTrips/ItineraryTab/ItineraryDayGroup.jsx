"use client";

import { ItineraryItem } from "./ItineraryItem";

export function ItineraryDayGroup({ dayNum, items, onDelete }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[10px] font-black text-[#008C8F] bg-[#008C8F]/10 px-2 py-0.5 rounded-md">
          Day {dayNum}
        </span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
      <div className="space-y-1">
        {items.map((item) => (
          <ItineraryItem key={item.id} item={item} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}
