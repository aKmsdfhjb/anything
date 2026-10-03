import { Clock, ChevronDown } from "lucide-react";
import { BEST_TIMES } from "./constants";

export function BestTimeSelector({
  bestTimeToVisit,
  onChange,
  showDropdown,
  onToggleDropdown,
  dropdownRef,
}) {
  return (
    <div className="mb-6 relative" ref={dropdownRef}>
      <label className="text-[#1E1E1E] font-bold text-sm mb-3 block">
        <Clock className="w-4 h-4 inline mr-2 text-[#06B6D4]" />
        Best Time to Visit
        <span className="text-gray-400 font-normal ml-2">(optional)</span>
      </label>
      <button
        type="button"
        onClick={onToggleDropdown}
        className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-4 text-left font-semibold outline-none focus:border-[#008C8F] transition-all flex items-center justify-between shadow-sm"
        style={{ color: bestTimeToVisit ? "#1E1E1E" : "#9CA3AF" }}
      >
        {bestTimeToVisit || "Select best time..."}
        <ChevronDown
          className="w-4 h-4 text-gray-400 shrink-0 transition-transform"
          style={{ transform: showDropdown ? "rotate(180deg)" : "none" }}
        />
      </button>
      {showDropdown && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl max-h-60 overflow-y-auto shadow-xl">
          {bestTimeToVisit && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                onToggleDropdown();
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-all text-[#EF4444] font-semibold text-sm border-b border-gray-100"
            >
              Clear selection
            </button>
          )}
          {BEST_TIMES.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => {
                onChange(time);
                onToggleDropdown();
              }}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-all text-sm font-semibold border-b border-gray-100 last:border-0 ${bestTimeToVisit === time ? "text-[#008C8F]" : "text-[#1E1E1E]"}`}
            >
              {time}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
