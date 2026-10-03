"use client";

import { Globe } from "lucide-react";
import { AFFILIATE_CATEGORY_INFO } from "../AffiliateCategoryInfo";
import { BookingLink } from "./BookingLink";

export function BookingCategoryGroup({ category, links }) {
  const catInfo = AFFILIATE_CATEGORY_INFO[category] || {
    label: category,
    icon: Globe,
    color: "#6B7280",
  };
  const CatIcon = catInfo.icon;

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <CatIcon className="w-3 h-3" style={{ color: catInfo.color }} />
        <span
          className="text-[10px] font-black uppercase tracking-wider"
          style={{ color: catInfo.color }}
        >
          {catInfo.label}
        </span>
      </div>
      <div className="space-y-1">
        {links.map((link) => (
          <BookingLink key={link.id} link={link} catInfo={catInfo} />
        ))}
      </div>
    </div>
  );
}
