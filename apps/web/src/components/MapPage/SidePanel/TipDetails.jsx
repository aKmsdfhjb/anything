import { ThumbsUp, Clock, Lightbulb, User, CheckCircle } from "lucide-react";
import { CATEGORY_COLORS } from "@/utils/mapConstants";

export function TipDetails({ tip }) {
  const tipColor = CATEGORY_COLORS[tip.category]?.hex || "#3B82F6";

  return (
    <div className="bg-[#0F172A] rounded-xl p-4">
      {tip.photo_url && (
        <img
          src={tip.photo_url}
          alt={tip.title}
          className="w-full h-32 object-cover rounded-lg mb-3"
        />
      )}
      <div className="flex items-center gap-2 mb-2">
        <span
          className="px-2 py-0.5 rounded-md text-xs font-bold"
          style={{
            backgroundColor: tipColor + "20",
            color: tipColor,
          }}
        >
          {CATEGORY_COLORS[tip.category]?.emoji}{" "}
          {CATEGORY_COLORS[tip.category]?.label}
        </span>
        {tip.upvotes > 0 && (
          <span className="flex items-center gap-1 text-xs text-[#64748B]">
            <ThumbsUp className="w-3 h-3" />
            {tip.upvotes}
          </span>
        )}
      </div>
      {tip.content && (
        <p className="text-sm text-[#CBD5E1] leading-relaxed mb-3">
          {tip.content}
        </p>
      )}
      {tip.best_time_to_visit && (
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-3 h-3 text-[#06B6D4]" />
          <span className="text-xs text-[#06B6D4] font-semibold">
            {tip.best_time_to_visit}
          </span>
        </div>
      )}
      {tip.special_tips && (
        <div className="flex items-start gap-2 mb-2">
          <Lightbulb className="w-3 h-3 text-[#F59E0B] mt-0.5 shrink-0" />
          <span className="text-xs text-[#94A3B8]">{tip.special_tips}</span>
        </div>
      )}
      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#1E293B]">
        <User className="w-3 h-3 text-[#64748B]" />
        <span className="text-xs text-[#64748B] font-semibold">
          {tip.username}
        </span>
        {tip.is_verified && <CheckCircle className="w-3 h-3 text-[#3B82F6]" />}
      </div>
    </div>
  );
}
