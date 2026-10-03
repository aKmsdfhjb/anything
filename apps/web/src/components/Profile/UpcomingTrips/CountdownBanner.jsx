"use client";

import { Clock, MapPin, Calendar } from "lucide-react";

export function CountdownBanner({ trip, daysLeft }) {
  const hours = Math.floor(
    ((new Date(trip.start_date) - new Date()) % 86400000) / 3600000,
  );

  return (
    <div className="bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-white/80" />
          <span className="text-xs font-bold text-white/80">Countdown</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-lg font-black text-white leading-none">
              {daysLeft}
            </p>
            <p className="text-[8px] font-bold text-white/60">DAYS</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-white leading-none">
              {hours}
            </p>
            <p className="text-[8px] font-bold text-white/60">HRS</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-1.5">
        <MapPin className="w-3 h-3 text-white/70" />
        <span className="text-[11px] text-white/80 font-semibold">
          {trip.destination_name}, {trip.country}
        </span>
        <span className="text-white/40 mx-1">·</span>
        <Calendar className="w-3 h-3 text-white/70" />
        <span className="text-[11px] text-white/80 font-semibold">
          {new Date(trip.start_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
          {trip.end_date &&
            ` – ${new Date(trip.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
        </span>
      </div>
    </div>
  );
}
