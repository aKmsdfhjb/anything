"use client";

import { CATEGORY_ICONS } from "../constants";

export function ItineraryAddForm({
  newItem,
  setNewItem,
  onCancel,
  onSubmit,
  isPending,
}) {
  return (
    <div className="bg-[#008C8F]/5 rounded-xl p-3 mb-3 space-y-2">
      <input
        type="text"
        placeholder="Activity title"
        value={newItem.title}
        onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
        className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#008C8F]"
      />
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Day"
          value={newItem.day_number}
          onChange={(e) =>
            setNewItem({
              ...newItem,
              day_number: parseInt(e.target.value) || 1,
            })
          }
          className="w-16 text-xs border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-1 focus:ring-[#008C8F]"
          min={1}
        />
        <input
          type="time"
          value={newItem.start_time}
          onChange={(e) =>
            setNewItem({ ...newItem, start_time: e.target.value })
          }
          className="w-24 text-xs border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-1 focus:ring-[#008C8F]"
        />
        <select
          value={newItem.category}
          onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
          className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-1 focus:ring-[#008C8F]"
        >
          {Object.keys(CATEGORY_ICONS).map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_ICONS[cat]} {cat}
            </option>
          ))}
        </select>
      </div>
      <input
        type="text"
        placeholder="Location (optional)"
        value={newItem.location_name}
        onChange={(e) =>
          setNewItem({ ...newItem, location_name: e.target.value })
        }
        className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#008C8F]"
      />
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="text-[10px] text-gray-500 font-bold px-3 py-1.5 rounded-lg hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={!newItem.title || isPending}
          className="text-[10px] text-white font-bold bg-[#008C8F] px-3 py-1.5 rounded-lg hover:bg-[#008C8F]/90 disabled:opacity-50"
        >
          {isPending ? "Adding…" : "Add Item"}
        </button>
      </div>
    </div>
  );
}
