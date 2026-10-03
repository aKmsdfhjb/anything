import { X } from "lucide-react";
import { CATEGORY_COLORS } from "@/utils/mapConstants";

export function SidePanelHeader({ selectedDest, onClose }) {
  return (
    <div
      className="p-5 border-b border-[#334155] sticky top-0 z-10"
      style={{
        background: `linear-gradient(135deg, ${CATEGORY_COLORS[selectedDest.dominantCategory]?.hex || "#3B82F6"}25, #0F172A)`,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="text-2xl font-black text-white">
            {selectedDest.destination_name}
          </h2>
          <p className="text-sm text-[#94A3B8] font-semibold">
            {selectedDest.destination_country}
          </p>
        </div>
        <button
          onClick={onClose}
          className="bg-[#1E293B] p-2 rounded-xl hover:bg-[#334155] transition-all"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
      <div className="flex gap-3">
        {selectedDest.recommend_count > 0 && (
          <span className="bg-[#10B981] bg-opacity-20 text-[#10B981] text-xs font-bold px-3 py-1 rounded-full">
            👍 {selectedDest.recommend_count}
          </span>
        )}
        {selectedDest.avoid_count > 0 && (
          <span className="bg-[#EF4444] bg-opacity-20 text-[#EF4444] text-xs font-bold px-3 py-1 rounded-full">
            👎 {selectedDest.avoid_count}
          </span>
        )}
        {selectedDest.warning_count > 0 && (
          <span className="bg-[#F59E0B] bg-opacity-20 text-[#F59E0B] text-xs font-bold px-3 py-1 rounded-full">
            ⚠️ {selectedDest.warning_count}
          </span>
        )}
      </div>
    </div>
  );
}
