import { MapPin } from "lucide-react";
import { CATEGORY_COLORS } from "@/utils/mapConstants";

export function DestinationPin({ pin, isSelected, onClick }) {
  if (!pin.visible) return null;

  const color = CATEGORY_COLORS[pin.dominantCategory]?.hex || "#3B82F6";

  return (
    <button
      onClick={onClick}
      className="absolute z-10 group"
      style={{
        left: pin.screenX - 16,
        top: pin.screenY - 16,
        pointerEvents: "auto",
      }}
    >
      <div className="relative">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 transition-transform group-hover:scale-125"
          style={{
            backgroundColor: color,
            borderColor: isSelected ? "white" : color,
            transform: isSelected ? "scale(1.3)" : undefined,
            boxShadow: `0 0 12px ${color}60`,
          }}
        >
          {pin.tip_count > 1 ? (
            <span className="text-white text-xs font-black">
              {pin.tip_count}
            </span>
          ) : (
            <MapPin className="w-4 h-4 text-white" fill="white" />
          )}
        </div>
        <div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            border: `2px solid ${color}`,
            transform: "scale(1.6)",
          }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 top-10 bg-[#0F172A] bg-opacity-95 border px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none backdrop-blur-sm"
          style={{ borderColor: color }}
        >
          <p className="text-xs font-bold text-white">{pin.destination_name}</p>
          <p className="text-xs text-[#64748B]">{pin.destination_country}</p>
        </div>
      </div>
    </button>
  );
}
