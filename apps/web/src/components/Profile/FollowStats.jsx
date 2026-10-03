export function FollowStats({ friends, followers, following, tips }) {
  return (
    <div className="flex items-center justify-center sm:justify-start gap-6 mt-5 pt-5 border-t border-gray-100">
      <div className="text-center">
        <p className="text-lg font-black text-gray-900">{friends}</p>
        <p className="text-xs text-gray-400 font-semibold">Friends</p>
      </div>
      <div className="w-px h-8 bg-gray-100"></div>
      <div className="text-center">
        <p className="text-lg font-black text-gray-900">{followers}</p>
        <p className="text-xs text-gray-400 font-semibold">Followers</p>
      </div>
      <div className="w-px h-8 bg-gray-100"></div>
      <div className="text-center">
        <p className="text-lg font-black text-gray-900">{following}</p>
        <p className="text-xs text-gray-400 font-semibold">Following</p>
      </div>
      <div className="w-px h-8 bg-gray-100"></div>
      <div className="text-center">
        <p className="text-lg font-black text-gray-900">{tips}</p>
        <p className="text-xs text-gray-400 font-semibold">Tips</p>
      </div>
    </div>
  );
}
