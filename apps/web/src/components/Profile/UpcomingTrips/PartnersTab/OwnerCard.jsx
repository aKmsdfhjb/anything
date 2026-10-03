"use client";

import { UserAvatar } from "./UserAvatar";

export function OwnerCard({ owner }) {
  return (
    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gradient-to-r from-[#008C8F]/5 to-[#7DE2D1]/5 mb-2">
      <UserAvatar
        profileImage={owner.profile_image}
        username={owner.username}
        size="medium"
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-900 truncate">
          {owner.username || "Trip Owner"}
        </p>
        <p className="text-[10px] text-[#008C8F] font-semibold">Organizer</p>
      </div>
      <span className="text-[10px] font-bold text-[#008C8F] bg-[#008C8F]/10 px-2 py-0.5 rounded-full">
        Owner
      </span>
    </div>
  );
}
