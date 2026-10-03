"use client";

import { useAffiliateBooking } from "@/hooks/useAffiliateBooking";
import { LoadingSpinner } from "../LoadingSpinner";
import { EmptyState } from "../EmptyState";
import { BookingCategoryGroup } from "./BookingCategoryGroup";

export function BookingSection({ trip }) {
  const { links, grouped, isLoading } = useAffiliateBooking(
    trip.destination_name,
    trip.country,
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (links.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          emoji="🔗"
          title="No booking links available"
          subtitle={`Check back later for deals to ${trip.destination_name}`}
        />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-3">
        <h4 className="text-sm font-black text-gray-900">
          Book for {trip.destination_name}
        </h4>
        <p className="text-[10px] text-gray-400 font-semibold">
          Find the best deals through our partners
        </p>
      </div>

      <div className="space-y-3">
        {Object.entries(grouped).map(([category, categoryLinks]) => (
          <BookingCategoryGroup
            key={category}
            category={category}
            links={categoryLinks}
          />
        ))}
      </div>
    </div>
  );
}
