import { Facebook, Twitter, Instagram, Globe } from "lucide-react";

export function SocialLinksDisplay({ profile }) {
  const hasSocial =
    profile?.facebook_url ||
    profile?.tiktok_url ||
    profile?.twitter_url ||
    profile?.instagram_url;

  if (!hasSocial) return null;

  return (
    <div className="flex items-center justify-center sm:justify-start gap-2 mt-4">
      {profile?.facebook_url && (
        <a
          href={profile.facebook_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors"
        >
          <Facebook className="w-4 h-4 text-blue-600" />
        </a>
      )}
      {profile?.twitter_url && (
        <a
          href={profile.twitter_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 rounded-full bg-sky-50 flex items-center justify-center hover:bg-sky-100 transition-colors"
        >
          <Twitter className="w-4 h-4 text-sky-500" />
        </a>
      )}
      {profile?.instagram_url && (
        <a
          href={profile.instagram_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 rounded-full bg-pink-50 flex items-center justify-center hover:bg-pink-100 transition-colors"
        >
          <Instagram className="w-4 h-4 text-pink-600" />
        </a>
      )}
      {profile?.tiktok_url && (
        <a
          href={profile.tiktok_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <Globe className="w-4 h-4 text-gray-700" />
        </a>
      )}
    </div>
  );
}
