import { Info } from "lucide-react";

export function ModerationInfo() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-6 flex items-start gap-3 shadow-sm">
      <Info className="w-5 h-5 text-[#008C8F] shrink-0 mt-0.5" />
      <p className="text-gray-500 text-sm">
        All tips are reviewed by our moderation team before going live. This
        keeps TipTrip trustworthy for everyone. You'll earn 5 reputation points
        when your tip is approved!
      </p>
    </div>
  );
}
