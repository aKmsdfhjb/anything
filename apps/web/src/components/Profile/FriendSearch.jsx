import {
  Search,
  X,
  UserPlus,
  Check,
  Clock,
  UserCheck,
  BadgeCheck,
} from "lucide-react";

export function FriendSearch({
  searchQuery,
  setSearchQuery,
  searchResults,
  onSendRequest,
  isSending,
  renderAvatar,
  searchInputRef,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#008C8F]" />
            <h3 className="text-base font-black text-gray-900">Find Friends</h3>
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Search by username to add friends or your travel partner
        </p>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-[#008C8F] focus-within:ring-1 focus-within:ring-[#008C8F] transition-all">
          <Search className="w-4 h-4 text-gray-300" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type a username..."
            className="flex-1 bg-transparent outline-none text-sm placeholder-gray-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")}>
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Search Results */}
      {searchQuery.length >= 2 && (
        <div className="border-t border-gray-100 max-h-72 overflow-y-auto">
          {searchResults.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No users found for "{searchQuery}"
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {searchResults.map((u) => {
                const statusEl =
                  u.friend_status === "friends" ? (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      Friends
                    </span>
                  ) : u.friend_status === "request_sent" ? (
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Sent
                    </span>
                  ) : u.friend_status === "request_received" ? (
                    <button
                      onClick={() => onSendRequest(u.user_id)}
                      className="text-xs font-bold text-white bg-emerald-500 px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Accept
                    </button>
                  ) : (
                    <button
                      onClick={() => onSendRequest(u.user_id)}
                      disabled={isSending}
                      className="text-xs font-bold text-white bg-[#008C8F] px-3 py-1.5 rounded-lg hover:bg-[#007072] transition-colors flex items-center gap-1"
                    >
                      <UserPlus className="w-3 h-3" />
                      Add Friend
                    </button>
                  );

                return (
                  <div
                    key={u.user_id}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors"
                  >
                    {renderAvatar(u.profile_image, u.username)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-900 text-sm truncate">
                          {u.username}
                        </span>
                        {u.is_verified && (
                          <BadgeCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        )}
                      </div>
                      {u.bio && (
                        <p className="text-xs text-gray-400 truncate">
                          {u.bio}
                        </p>
                      )}
                    </div>
                    {statusEl}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
