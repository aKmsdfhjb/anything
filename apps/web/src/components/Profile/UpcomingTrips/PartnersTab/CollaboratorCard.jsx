"use client";

import { X } from "lucide-react";
import { UserAvatar } from "./UserAvatar";

export function CollaboratorCard({ collaborator, onRemove }) {
  const statusColor =
    collaborator.status === "accepted"
      ? "text-emerald-600 bg-emerald-50"
      : collaborator.status === "pending"
        ? "text-amber-600 bg-amber-50"
        : "text-gray-500 bg-gray-100";

  return (
    <div className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-gray-50 group transition-colors">
      <UserAvatar
        profileImage={collaborator.profile_image}
        username={collaborator.username}
        size="medium"
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-900 truncate">
          {collaborator.username || collaborator.email}
        </p>
        <p className="text-[10px] text-gray-400 capitalize">
          {collaborator.role}
        </p>
      </div>
      <span
        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusColor}`}
      >
        {collaborator.status}
      </span>
      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all p-1"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
