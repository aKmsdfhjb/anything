"use client";

import { Calendar, Users, ClipboardList } from "lucide-react";

const TABS = [
  { key: "itinerary", label: "Itinerary", icon: Calendar },
  { key: "partners", label: "Partners", icon: Users },
  { key: "clipboard", label: "Clipboard", icon: ClipboardList },
];

export function TabNavigation({ activeTab, onTabChange }) {
  return (
    <div className="flex border-b border-gray-100 bg-gray-50/50">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const TabIcon = tab.icon;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-all border-b-2 ${
              isActive
                ? "text-[#008C8F] border-[#008C8F] bg-white"
                : "text-gray-400 border-transparent hover:text-gray-600"
            }`}
          >
            <TabIcon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
