import { Layers } from "lucide-react";
import { CATEGORY_COLORS } from "@/utils/mapConstants";

export function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-20 bg-[#1E293B] bg-opacity-90 border border-[#334155] rounded-2xl p-4 hidden md:block backdrop-blur-sm">
      <p className="text-[#64748B] text-xs font-bold mb-3 uppercase">
        Pin Colors
      </p>
      <div className="space-y-2">
        {Object.entries(CATEGORY_COLORS).map(([key, val]) => (
          <div key={key} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full shadow-lg"
              style={{
                backgroundColor: val.hex,
                boxShadow: `0 0 6px ${val.hex}80`,
              }}
            />
            <span className="text-xs text-[#94A3B8] font-semibold">
              {val.emoji} {val.label}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2 pt-1 border-t border-[#334155] mt-2">
          <Layers className="w-3 h-3 text-[#64748B]" />
          <span className="text-xs text-[#64748B] font-semibold">
            Numbers = stacked tips
          </span>
        </div>
      </div>
    </div>
  );
}
