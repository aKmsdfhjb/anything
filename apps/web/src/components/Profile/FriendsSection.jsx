import { useState } from "react";
import { Users, UserMinus, Check, X, BadgeCheck } from "lucide-react";

export function FriendsSection({
  friends,
  pendingRequests,
  onUnfriend,
  onRespondToRequest,
  renderAvatar,
}) {
  const [friendTab, setFriendTab] = useState("friends");

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-[#008C8F]" />
        <h3 className="text-base font-black text-gray-900">Friends</h3>
        {pendingRequests.length > 0 && (
          <span className="bg-[#008C8F] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {pendingRequests.length}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-4">
        {[
          { key: "friends", label: `Friends (${friends.length})` },
          {
            key: "pending",
            label: "Requests",
            count: pendingRequests.length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFriendTab(tab.key)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${friendTab === tab.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            {tab.label}
            {tab.count > 0 && friendTab !== tab.key ? ` (${tab.count})` : ""}
          </button>
        ))}
      </div>

      {friendTab === "friends" &&
        (friends.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">👋</p>
            <p className="text-sm font-semibold text-gray-500">
              No friends yet
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Use the search above to find people!
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {friends.map((friend) => (
              <div
                key={friend.user_id}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                {renderAvatar(friend.profile_image, friend.username, "w-9 h-9")}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-gray-900 text-sm">
                      {friend.username}
                    </span>
                    {friend.is_verified && (
                      <BadgeCheck className="w-3 h-3 text-blue-500" />
                    )}
                  </div>
                  {friend.bio && (
                    <p className="text-xs text-gray-400 truncate">
                      {friend.bio}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Remove ${friend.username} as a friend?`))
                      onUnfriend(friend.user_id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                >
                  <UserMinus className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>
        ))}

      {friendTab === "pending" &&
        (pendingRequests.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">
            No pending requests
          </p>
        ) : (
          <div className="space-y-2">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center gap-3 bg-pink-50/50 p-3 rounded-xl border border-pink-100/50"
              >
                {renderAvatar(req.profile_image, req.username, "w-9 h-9")}
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-gray-900 text-sm">
                    {req.username}
                  </span>
                  <p className="text-xs text-gray-400">
                    wants to be your friend
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      onRespondToRequest({
                        id: req.id,
                        status: "accepted",
                      })
                    }
                    className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() =>
                      onRespondToRequest({
                        id: req.id,
                        status: "declined",
                      })
                    }
                    className="bg-gray-200 text-gray-500 p-1.5 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}
