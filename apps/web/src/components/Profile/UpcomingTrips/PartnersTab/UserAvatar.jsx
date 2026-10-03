"use client";

export function UserAvatar({ profileImage, username, size = "medium" }) {
  const sizeClasses = {
    small: "w-7 h-7 text-[10px]",
    medium: "w-8 h-8 text-xs",
  };

  const sizeClass = sizeClasses[size] || sizeClasses.medium;

  if (profileImage) {
    return (
      <img
        src={profileImage}
        alt=""
        className={`${sizeClass} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br from-[#008C8F] to-[#7DE2D1] flex items-center justify-center`}
    >
      <span className="text-white font-bold">
        {username?.[0]?.toUpperCase() || "?"}
      </span>
    </div>
  );
}
