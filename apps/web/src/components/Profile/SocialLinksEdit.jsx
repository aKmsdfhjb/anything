import { Facebook, Twitter, Instagram, Globe } from "lucide-react";

export function SocialLinksEdit({
  facebookUrl,
  setFacebookUrl,
  twitterUrl,
  setTwitterUrl,
  instagramUrl,
  setInstagramUrl,
  tiktokUrl,
  setTiktokUrl,
}) {
  const fields = [
    {
      icon: <Facebook className="w-4 h-4 text-blue-600" />,
      val: facebookUrl,
      set: setFacebookUrl,
      ph: "Facebook URL",
    },
    {
      icon: <Twitter className="w-4 h-4 text-sky-500" />,
      val: twitterUrl,
      set: setTwitterUrl,
      ph: "Twitter URL",
    },
    {
      icon: <Instagram className="w-4 h-4 text-pink-600" />,
      val: instagramUrl,
      set: setInstagramUrl,
      ph: "Instagram URL",
    },
    {
      icon: <Globe className="w-4 h-4 text-gray-700" />,
      val: tiktokUrl,
      set: setTiktokUrl,
      ph: "TikTok URL",
    },
  ];

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">
        Social Links
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fields.map((f, i) => (
          <div
            key={i}
            className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5"
          >
            {f.icon}
            <input
              type="text"
              value={f.val}
              onChange={(e) => f.set(e.target.value)}
              placeholder={f.ph}
              className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
