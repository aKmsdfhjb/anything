import { MessageCircle, MapPin } from "lucide-react";

export function UserTipsList({ tips }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-4 h-4 text-[#008C8F]" />
        <h3 className="text-base font-black text-gray-900">Your Tips</h3>
        {tips.length > 0 && (
          <span className="bg-[#008C8F]/10 text-[#008C8F] text-[10px] font-bold px-2 py-0.5 rounded-full">
            {tips.length}
          </span>
        )}
      </div>

      {tips.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-3xl mb-2">💬</p>
          <p className="text-sm font-semibold text-gray-500">
            No tips shared yet
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Share your travel knowledge!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tips.slice(0, 5).map((tip) => (
            <div key={tip.id} className="p-3 rounded-xl bg-gray-50">
              <div className="flex items-center gap-1 mb-1">
                <MapPin className="w-3 h-3 text-[#008C8F]" />
                <span className="text-xs text-gray-400">
                  {tip.destination_name}, {tip.destination_country}
                </span>
              </div>
              <p className="text-sm font-bold text-gray-900">{tip.title}</p>
              {tip.content && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {tip.content}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
