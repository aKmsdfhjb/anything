import { MapPin } from "lucide-react";
import { CATEGORY_COLORS, VENUE_EMOJIS } from "@/utils/mapConstants";
import { TipDetails } from "./TipDetails";

export function VenueCard({ venue, isExpanded, onToggle }) {
  const venueColor = CATEGORY_COLORS[venue.category]?.hex || "#3B82F6";
  const venueEmoji = VENUE_EMOJIS[venue.venue_type] || "📍";

  return (
    <div className="bg-[#1E293B] border border-[#334155] rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 text-left flex items-center gap-3"
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{ backgroundColor: venueColor + "20" }}
        >
          {venueEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-sm truncate">
            {venue.venue_name}
          </h3>
          <p className="text-[#64748B] text-xs">
            {venue.tip_count} tip{venue.tip_count > 1 ? "s" : ""} •{" "}
            {venue.location_name || ""}
          </p>
        </div>
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: venueColor }}
        >
          {venue.tip_count > 1 ? (
            <span className="text-white text-xs font-black">
              {venue.tip_count}
            </span>
          ) : (
            <MapPin className="w-3 h-3 text-white" fill="white" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-[#334155] p-4 space-y-4">
          {venue.tips.map((tip) => (
            <TipDetails key={tip.id} tip={tip} />
          ))}
        </div>
      )}
    </div>
  );
}
