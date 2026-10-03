import { Filter } from "lucide-react";
import { FILTER_OPTIONS } from "@/utils/mapConstants";

export function MapControls({ filterCategory, onFilterChange }) {
  return (
    <div className="absolute top-16 left-0 right-0 z-20 px-5 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 flex-1">
          <Filter className="w-4 h-4 text-[#64748B] shrink-0" />
          {FILTER_OPTIONS.map((f) => {
            const isActive = filterCategory === f.value;
            return (
              <button
                key={f.value}
                onClick={() => onFilterChange(f.value)}
                className="shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all border"
                style={{
                  borderColor: isActive ? f.color : "#334155",
                  backgroundColor: isActive ? f.color + "20" : "#1E293B",
                  color: isActive ? f.color : "#94A3B8",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
