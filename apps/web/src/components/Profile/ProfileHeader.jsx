import { Edit, Check } from "lucide-react";

export function ProfileHeader({ isEditing, onToggleEdit }) {
  return (
    <div className="bg-gradient-to-br from-[#008C8F] to-[#7DE2D1] pt-6 pb-20 px-5 md:px-8 relative">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">My Profile</h1>
        <button
          onClick={onToggleEdit}
          className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-white text-sm font-bold flex items-center gap-2 hover:bg-white/30 transition-all"
        >
          {isEditing ? (
            <>
              <Check className="w-4 h-4" /> Save
            </>
          ) : (
            <>
              <Edit className="w-4 h-4" /> Edit
            </>
          )}
        </button>
      </div>
    </div>
  );
}
