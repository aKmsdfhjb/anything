import { MapPin, X } from "lucide-react";

export function DestinationSelector({
  destinationId,
  destinationSearch,
  onSearchChange,
  onDestinationSelect,
  onDestinationClear,
  destinations,
  showDropdown,
  onFocus,
  dropdownRef,
}) {
  const selectedDestination = destinations.find(
    (d) => d.id === parseInt(destinationId),
  );
  const filteredDestinations = destinations.filter(
    (d) =>
      d.name.toLowerCase().includes(destinationSearch.toLowerCase()) ||
      d.country.toLowerCase().includes(destinationSearch.toLowerCase()),
  );

  return (
    <div className="mb-6 relative" ref={dropdownRef}>
      <label className="text-[#1E1E1E] font-bold text-sm mb-3 block">
        <MapPin className="w-4 h-4 inline mr-2 text-[#008C8F]" />
        Destination *
      </label>
      {selectedDestination ? (
        <div className="bg-white border border-[#7DE2D1] rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[#1E1E1E] font-bold">
              {selectedDestination.name}
            </p>
            <p className="text-gray-500 text-sm">
              {selectedDestination.country}
            </p>
          </div>
          <button
            onClick={onDestinationClear}
            className="bg-gray-100 p-2 rounded-xl"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={destinationSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={onFocus}
            placeholder="Search for a city, country..."
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-4 text-[#1E1E1E] font-semibold outline-none focus:border-[#008C8F] transition-all placeholder-gray-400 shadow-sm"
          />
          {showDropdown && filteredDestinations.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl max-h-60 overflow-y-auto shadow-xl">
              {filteredDestinations.slice(0, 20).map((dest) => (
                <button
                  key={dest.id}
                  onClick={() => onDestinationSelect(dest)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-all flex items-center gap-3 border-b border-gray-100 last:border-0"
                >
                  <MapPin className="w-4 h-4 text-[#008C8F] shrink-0" />
                  <div>
                    <p className="text-[#1E1E1E] font-semibold text-sm">
                      {dest.name}
                    </p>
                    <p className="text-gray-400 text-xs">{dest.country}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
