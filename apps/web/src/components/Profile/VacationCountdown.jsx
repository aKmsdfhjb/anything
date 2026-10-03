import { Sparkles, X } from "lucide-react";

export function VacationCountdown({ trip, countdown, onRemove }) {
  if (!trip || !countdown || countdown.expired) return null;

  return (
    <div className="bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] rounded-2xl p-5 text-white shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-black uppercase tracking-wide">
            Vacation Countdown
          </span>
        </div>
        <button
          onClick={onRemove}
          className="bg-white/20 p-1.5 rounded-lg hover:bg-white/30 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="text-white/70 text-sm mb-4">
        ✈️ {trip.name} — {trip.destination}, {trip.country}
      </p>
      <div className="flex gap-3">
        <div className="bg-white/15 backdrop-blur-sm px-5 py-3 rounded-xl text-center border border-white/10">
          <p className="text-3xl font-black leading-tight">{countdown.days}</p>
          <p className="text-[10px] font-bold text-white/60 mt-0.5">DAYS</p>
        </div>
        <div className="bg-white/15 backdrop-blur-sm px-5 py-3 rounded-xl text-center border border-white/10">
          <p className="text-3xl font-black leading-tight">{countdown.hours}</p>
          <p className="text-[10px] font-bold text-white/60 mt-0.5">HOURS</p>
        </div>
      </div>
    </div>
  );
}
