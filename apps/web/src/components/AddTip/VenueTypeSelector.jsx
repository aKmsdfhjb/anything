import { ChevronDown } from "lucide-react";
import { VENUE_TYPES } from "./constants";

export function VenueTypeSelector({
  venueType,
  onChange,
  showDropdown,
  onToggleDropdown,
  dropdownRef,
}) {
  const selectedVenueLabel =
    VENUE_TYPES.find((vt) => vt.value === venueType)?.label || "";

  return (
    <div className="mb-6 relative" ref={dropdownRef}>
      <label className="text-[#1E1E1E] font-bold text-sm mb-3 block">
        <ChevronDown className="w-4 h-4 inline mr-2 text-[#008C8F]" />
        Venue Type *
      </label>
      <button
        type="button"
        onClick={onToggleDropdown}
        className="w-full bg-white border rounded-2xl px-4 py-4 text-left font-semibold outline-none transition-all flex items-center justify-between shadow-sm"
        style={{
          borderColor: showDropdown
            ? "#008C8F"
            : venueType
              ? "#008C8F"
              : "#E5E7EB",
          color: venueType ? "#1E1E1E" : "#9CA3AF",
        }}
      >
        {selectedVenueLabel || "Select a type..."}
        <ChevronDown
          className="w-4 h-4 text-gray-400 shrink-0 transition-transform"
          style={{ transform: showDropdown ? "rotate(180deg)" : "none" }}
        />
      </button>
      {showDropdown && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl max-h-60 overflow-y-auto shadow-xl">
          {VENUE_TYPES.map((vt) => {
            const isSelected = venueType === vt.value;
            return (
              <button
                key={vt.value}
                type="button"
                onClick={() => {
                  onChange(vt.value);
                  onToggleDropdown();
                }}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-all text-sm font-semibold border-b border-gray-100 last:border-0 ${isSelected ? "text-[#008C8F] bg-[#008C8F10]" : "text-[#1E1E1E]"}`}
              >
                {vt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
