import { useMemo } from "react";
import { SidePanelHeader } from "./SidePanelHeader";
import { BookingSection } from "./BookingSection";
import { VenueCard } from "./VenueCard";

export function SidePanel({
  selectedDest,
  venues,
  selectedVenue,
  onVenueSelect,
  onClose,
  groupedAffLinks,
}) {
  const selectedDestVenues = useMemo(() => {
    if (!selectedDest) return [];
    return venues.filter(
      (v) =>
        v.destination_name.toLowerCase() ===
        selectedDest.destination_name.toLowerCase(),
    );
  }, [selectedDest, venues]);

  if (!selectedDest) return null;

  return (
    <div className="absolute top-0 right-0 bottom-0 z-30 w-full sm:w-96 bg-[#0F172A] border-l border-[#334155] overflow-y-auto backdrop-blur-sm">
      <SidePanelHeader selectedDest={selectedDest} onClose={onClose} />

      <div className="p-5 space-y-3">
        <BookingSection groupedAffLinks={groupedAffLinks} />

        <p className="text-[#64748B] text-xs font-bold uppercase mb-2">
          {selectedDestVenues.length} Venues / Places
        </p>

        {selectedDestVenues.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[#64748B] text-sm">No approved tips here yet</p>
            <a
              href="/add-tip"
              className="text-[#FF006E] text-sm font-bold mt-2 inline-block"
            >
              Be the first to add one →
            </a>
          </div>
        )}

        {selectedDestVenues.map((venue) => (
          <VenueCard
            key={venue.venue_key}
            venue={venue}
            isExpanded={selectedVenue?.venue_key === venue.venue_key}
            onToggle={() =>
              onVenueSelect(
                selectedVenue?.venue_key === venue.venue_key ? null : venue,
              )
            }
          />
        ))}
      </div>
    </div>
  );
}
