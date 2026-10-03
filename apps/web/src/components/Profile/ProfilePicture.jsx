import { Camera } from "lucide-react";

export function ProfilePicture({
  displayImage,
  username,
  uploading,
  onImageClick,
}) {
  return (
    <div className="relative shrink-0">
      <button
        onClick={onImageClick}
        disabled={uploading}
        className="relative group"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#008C8F] to-[#7DE2D1] p-[3px]">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
            {uploading ? (
              <div
                className="w-6 h-6 border-2 border-gray-200 border-t-[#008C8F] rounded-full"
                style={{ animation: "spin .8s linear infinite" }}
              ></div>
            ) : displayImage ? (
              <img
                src={displayImage}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="text-[#008C8F] text-2xl font-black">
                {username?.[0]?.toUpperCase() || "U"}
              </span>
            )}
          </div>
        </div>
        <div className="absolute -bottom-1 -right-1 bg-[#008C8F] w-7 h-7 rounded-full flex items-center justify-center border-[3px] border-white group-hover:scale-110 transition-transform">
          <Camera className="w-3.5 h-3.5 text-white" />
        </div>
      </button>
    </div>
  );
}
