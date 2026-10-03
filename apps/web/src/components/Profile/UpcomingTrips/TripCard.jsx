"use client";

import { Plane, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

export function TripCard({
  trip,
  daysLeft,
  isExpanded,
  isActive,
  onExpand,
  onSetCountdown,
}) {
  return (
    <div
      className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${isExpanded ? "bg-[#008C8F]/5" : "bg-gray-50 hover:bg-gray-100/80"}`}
      onClick={onExpand}
    >
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#008C8F]/10 to-[#7DE2D1]/10 flex items-center justify-center shrink-0">
        <Plane className="w-4 h-4 text-[#008C8F]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm truncate">
          {trip.trip_name}
        </p>
        <p className="text-xs text-gray-400">
          {trip.destination_name} · {daysLeft} days away
        </p>
      </div>

      {/* Countdown Badge */}
      <div className="flex items-center gap-2 shrink-0">
        {isActive ? (
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {daysLeft}d
          </span>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSetCountdown(trip.id);
            }}
            className="text-[10px] text-[#008C8F] font-bold bg-[#008C8F]/5 px-2 py-1 rounded-lg hover:bg-[#008C8F]/10 transition-colors"
          >
            Set Countdown
          </button>
        )}
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </div>
    </div>
  );
}
