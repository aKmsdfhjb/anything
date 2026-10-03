import { Sparkles, ExternalLink } from "lucide-react";
import { BOOKING_CAT_COLORS } from "@/utils/mapConstants";

export function BookingSection({ groupedAffLinks }) {
  if (Object.keys(groupedAffLinks).length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-[#334155] rounded-2xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-[#FF006E]" />
        <p className="text-white font-bold text-sm">Book Your Trip</p>
      </div>
      {Object.entries(groupedAffLinks).map(([cat, links]) => {
        const catConfig = BOOKING_CAT_COLORS[cat] || {
          label: cat,
          emoji: "📍",
          color: "#64748B",
        };
        return (
          <div key={cat} className="mb-3 last:mb-0">
            <p
              className="text-xs font-bold mb-1.5"
              style={{ color: catConfig.color }}
            >
              {catConfig.emoji} {catConfig.label}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {links.map((link) => (
                <a
                  key={link.id}
                  href={link.booking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                  style={{
                    backgroundColor: catConfig.color + "15",
                    color: catConfig.color,
                  }}
                >
                  {link.partner_name}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
