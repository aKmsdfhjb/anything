export function ProfileInfo({ profile, email }) {
  return (
    <div className="flex-1 text-center sm:text-left w-full">
      <h2 className="text-xl font-black text-gray-900">
        {profile?.username || "User"}
      </h2>
      <p className="text-sm text-gray-400 mb-2">{profile?.email || email}</p>
      {profile?.bio && (
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          {profile.bio}
        </p>
      )}
    </div>
  );
}
