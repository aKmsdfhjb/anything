"use client";

import { Plus } from "lucide-react";
import { useCollaborators } from "@/hooks/useCollaborators";
import { LoadingSpinner } from "../LoadingSpinner";
import { EmptyState } from "../EmptyState";
import { InviteSearch } from "./InviteSearch";
import { OwnerCard } from "./OwnerCard";
import { CollaboratorCard } from "./CollaboratorCard";

export function PartnersTab({ trip }) {
  const {
    owner,
    collaborators,
    searchResults,
    existingUserIds,
    isLoading,
    searchQuery,
    setSearchQuery,
    showSearch,
    setShowSearch,
    inviteMutation,
    removeMutation,
  } = useCollaborators(trip.id);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-black text-gray-900">Travel Partners</h4>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="flex items-center gap-1 text-[10px] font-bold text-[#008C8F] bg-[#008C8F]/5 px-2.5 py-1.5 rounded-lg hover:bg-[#008C8F]/10 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Invite
        </button>
      </div>

      {showSearch && (
        <InviteSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          existingUserIds={existingUserIds}
          onInvite={(userId) => inviteMutation.mutate(userId)}
          isPending={inviteMutation.isPending}
        />
      )}

      {owner && <OwnerCard owner={owner} />}

      {collaborators.length === 0 ? (
        <EmptyState
          emoji="👥"
          title="No travel partners yet"
          subtitle="Invite friends to plan together"
        />
      ) : (
        <div className="space-y-1">
          {collaborators.map((collab) => (
            <CollaboratorCard
              key={collab.id}
              collaborator={collab}
              onRemove={() => removeMutation.mutate(collab.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
