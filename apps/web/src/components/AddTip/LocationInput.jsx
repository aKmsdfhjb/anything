import { MapPin, Loader2, Search } from "lucide-react";

export function LocationInput({
  locationName,
  onLocationChange,
  locationSuggestions,
  onSelectLocation,
  locationSearchLoading,
  showDropdown,
  dropdownRef,
}) {
  return (
    <div className="mb-6 relative" ref={dropdownRef}>
      <label className="text-[#1E1E1E] font-bold text-sm mb-3 block">
        <MapPin className="w-4 h-4 inline mr-2 text-[#10B981]" />
        Address or Area *
      </label>
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={locationName}
          onChange={(e) => onLocationChange(e.target.value)}
          placeholder="e.g. Old Town Square, District 1, Near Central Station..."
          className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-4 text-[#1E1E1E] font-semibold outline-none focus:border-[#008C8F] transition-all placeholder-gray-400 shadow-sm"
        />
      </div>
      {locationSearchLoading && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl max-h-60 overflow-y-auto shadow-xl">
          <div className="flex items-center gap-3 p-3">
            <Loader2 className="w-4 h-4 text-[#008C8F]" />
            <span className="text-gray-500 text-sm">
              Searching for locations...
            </span>
          </div>
        </div>
      )}
      {showDropdown && locationSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl max-h-60 overflow-y-auto shadow-xl">
          <div className="flex items-center gap-3 p-3">
            <MapPin className="w-4 h-4 text-[#008C8F]" />
            <span className="text-gray-500 text-sm">Select a location:</span>
          </div>
          <ul className="text-left text-sm text-gray-500 space-y-2">
            {locationSuggestions.map((suggestion) => (
              <li key={suggestion.place_id}>
                <button
                  type="button"
                  onClick={() => onSelectLocation(suggestion)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-all text-[#1E1E1E]"
                >
                  {suggestion.description}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
