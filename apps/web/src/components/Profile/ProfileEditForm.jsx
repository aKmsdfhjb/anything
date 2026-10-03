export function ProfileEditForm({ username, setUsername, bio, setBio }) {
  return (
    <div className="flex-1 text-center sm:text-left w-full">
      <div className="space-y-3 w-full">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-gray-900 outline-none focus:border-[#008C8F] focus:ring-1 focus:ring-[#008C8F] transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
            placeholder="Tell people about yourself..."
            className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-gray-900 outline-none focus:border-[#008C8F] focus:ring-1 focus:ring-[#008C8F] transition-all resize-none"
          />
        </div>
      </div>
    </div>
  );
}
