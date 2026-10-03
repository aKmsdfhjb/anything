"use client";

import { ExternalLink } from "lucide-react";

export function BookingLink({ link, catInfo }) {
  const CatIcon = catInfo.icon;
  const iconBgColor = catInfo.color + "15";

  return (
    <a
      href={link.booking_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all group"
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: iconBgColor }}
      >
        <CatIcon className="w-3.5 h-3.5" style={{ color: catInfo.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-900 truncate">
          {link.partner_name}
        </p>
        {link.description && (
          <p className="text-[10px] text-gray-400 truncate">
            {link.description}
          </p>
        )}
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#008C8F] transition-colors shrink-0" />
    </a>
  );
}
