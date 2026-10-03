"use client";

import { useState } from "react";
import { Plane } from "lucide-react";
import { EmptyState } from "./UpcomingTrips/EmptyState";
import { TripCard } from "./UpcomingTrips/TripCard";
import { ExpandedTripView } from "./UpcomingTrips/ExpandedTripView";

export function UpcomingTrips({ trips, activeCountdownId, onSetCountdown }) {
  const [expandedTrip, setExpandedTrip] = useState(null);
  const [activeTab, setActiveTab] = useState("itinerary");

  if (trips.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Plane className="w-4 h-4 text-[#008C8F]" />
          <h3 className="text-base font-black text-gray-900">Upcoming Trips</h3>
        </div>
        <EmptyState
          emoji="✈️"
          title="No trips planned yet"
          subtitle="Head to Trips to plan your next adventure!"
        />
      </div>
    );
  }

  const handleExpand = (tripId) => {
    if (expandedTrip === tripId) {
      setExpandedTrip(null);
    } else {
      setExpandedTrip(tripId);
      setActiveTab("itinerary");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Plane className="w-4 h-4 text-[#008C8F]" />
          <h3 className="text-base font-black text-gray-900">Upcoming Trips</h3>
          <span className="bg-[#008C8F]/10 text-[#008C8F] text-[10px] font-bold px-2 py-0.5 rounded-full">
            {trips.length}
          </span>
        </div>
      </div>

      <div className="px-5 pb-5 space-y-3">
        {trips.map((trip) => {
          const isExpanded = expandedTrip === trip.id;
          const daysLeft = Math.ceil(
            (new Date(trip.start_date) - new Date()) / 86400000,
          );
          const isActive = activeCountdownId === trip.id;

          return (
            <div
              key={trip.id}
              className="rounded-xl border border-gray-100 overflow-hidden"
            >
              <TripCard
                trip={trip}
                daysLeft={daysLeft}
                isExpanded={isExpanded}
                isActive={isActive}
                onExpand={() => handleExpand(trip.id)}
                onSetCountdown={onSetCountdown}
              />

              {isExpanded && (
                <ExpandedTripView
                  trip={trip}
                  daysLeft={daysLeft}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
