"use client";

import { Search } from "lucide-react";
import { UserAvatar } from "./UserAvatar";

export function InviteSearch({
  searchQuery,
  setSearchQuery,
  searchResults,
  existingUserIds,
  onInvite,
  isPending,
}) {
  const filteredResults = searchResults.filter(
    (u) => !existingUserIds.has(u.user_id),
  );

  return (
    <div className="bg-[#008C8F]/5 rounded-xl p-3 mb-3">
      <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2">
        <Search className="w-3.5 h-3.5 text-gray-400" />
        <input
          type="text"
          placeholder="Search users to invite…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 text-xs focus:outline-none"
          autoFocus
        />
      </div>
      {filteredResults.length > 0 && (
        <div className="mt-2 space-y-1 max-h-[120px] overflow-y-auto">
          {filteredResults.map((user) => (
            <div
              key={user.user_id}
              className="flex items-center gap-2 p-2 rounded-lg bg-white hover:bg-gray-50"
            >
              <UserAvatar
                profileImage={user.profile_image}
                username={user.username}
                size="small"
              />
              <span className="flex-1 text-xs font-bold text-gray-900 truncate">
                {user.username}
              </span>
              <button
                onClick={() => onInvite(user.user_id)}
                disabled={isPending}
                className="text-[10px] font-bold text-white bg-[#008C8F] px-2.5 py-1 rounded-lg hover:bg-[#008C8F]/90 disabled:opacity-50"
              >
                Invite
              </button>
            </div>
          ))}
        </div>
      )}
      {searchQuery.length >= 2 && filteredResults.length === 0 && (
        <p className="text-[10px] text-gray-400 text-center mt-2">
          No users found
        </p>
      )}
    </div>
  );
}
