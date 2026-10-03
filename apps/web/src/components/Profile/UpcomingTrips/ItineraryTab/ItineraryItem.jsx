"use client";

import { Trash2 } from "lucide-react";
import { CATEGORY_ICONS } from "../constants";

export function ItineraryItem({ item, onDelete }) {
  return (
    <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-gray-50 group transition-colors">
      <span className="text-sm">{CATEGORY_ICONS[item.category] || "📌"}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-900 truncate">{item.title}</p>
        <div className="flex items-center gap-2">
          {item.start_time && (
            <span className="text-[10px] text-gray-400">{item.start_time}</span>
          )}
          {item.location_name && (
            <span className="text-[10px] text-gray-400 truncate">
              📍 {item.location_name}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={() => onDelete(item.id)}
        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all p-1"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}
