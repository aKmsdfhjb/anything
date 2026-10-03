"use client";

import { CheckCircle2, Circle, Trash2 } from "lucide-react";

export function ChecklistItem({ item, onToggle, onDelete }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 group transition-colors">
      <button
        onClick={() => onToggle(item.id, !item.is_packed)}
        className="shrink-0"
      >
        {item.is_packed ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        ) : (
          <Circle className="w-4 h-4 text-gray-300" />
        )}
      </button>
      <span
        className={`flex-1 text-xs font-semibold truncate ${item.is_packed ? "text-gray-400 line-through" : "text-gray-900"}`}
      >
        {item.item_name}
      </span>
      {item.quantity > 1 && (
        <span className="text-[10px] text-gray-400 font-bold">
          ×{item.quantity}
        </span>
      )}
      <button
        onClick={() => onDelete(item.id)}
        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all p-0.5"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}
