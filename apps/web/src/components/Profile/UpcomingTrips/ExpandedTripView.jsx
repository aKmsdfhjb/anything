"use client";

import { CountdownBanner } from "./CountdownBanner";
import { TabNavigation } from "./TabNavigation";
import { ItineraryTab } from "./ItineraryTab/ItineraryTab";
import { PartnersTab } from "./PartnersTab/PartnersTab";
import { ClipboardTab } from "./ClipboardTab/ClipboardTab";

export function ExpandedTripView({ trip, daysLeft, activeTab, setActiveTab }) {
  return (
    <div className="border-t border-gray-100">
      <CountdownBanner trip={trip} daysLeft={daysLeft} />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="max-h-[420px] overflow-y-auto">
        {activeTab === "itinerary" && <ItineraryTab trip={trip} />}
        {activeTab === "partners" && <PartnersTab trip={trip} />}
        {activeTab === "clipboard" && <ClipboardTab trip={trip} />}
      </div>
    </div>
  );
}
