"use client";

import { PACKING_CATEGORIES, PACKING_CAT_EMOJI } from "../constants";

export function ChecklistAddForm({
  itemName,
  setItemName,
  category,
  setCategory,
  onSubmit,
  isPending,
}) {
  return (
    <div className="bg-[#008C8F]/5 rounded-xl p-3 mb-3 space-y-2">
      <input
        type="text"
        placeholder="Item name"
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
        className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#008C8F]"
        autoFocus
      />
      <div className="flex gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-1 focus:ring-[#008C8F]"
        >
          {PACKING_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {PACKING_CAT_EMOJI[cat]} {cat}
            </option>
          ))}
        </select>
        <button
          onClick={onSubmit}
          disabled={!itemName || isPending}
          className="text-[10px] text-white font-bold bg-[#008C8F] px-3 py-1.5 rounded-lg hover:bg-[#008C8F]/90 disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </div>
  );
}
