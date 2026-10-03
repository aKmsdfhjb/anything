"use client";

import { CheckCircle2, FileText, Link2 } from "lucide-react";

const SUB_TABS = [
  { key: "checklist", label: "Checklist", icon: CheckCircle2 },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "booking", label: "Book", icon: Link2 },
];

export function ClipboardTabNavigation({ activeSubTab, onSubTabChange }) {
  return (
    <div className="flex border-b border-gray-100 px-2">
      {SUB_TABS.map((tab) => {
        const isActive = activeSubTab === tab.key;
        const TabIcon = tab.icon;
        return (
          <button
            key={tab.key}
            onClick={() => onSubTabChange(tab.key)}
            className={`flex items-center gap-1 px-3 py-2 text-[10px] font-bold border-b-2 transition-all ${
              isActive
                ? "text-[#008C8F] border-[#008C8F]"
                : "text-gray-400 border-transparent hover:text-gray-600"
            }`}
          >
            <TabIcon className="w-3 h-3" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
