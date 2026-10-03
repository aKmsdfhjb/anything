"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Globe,
  Flame,
  X,
  MapPin,
  ChevronLeft,
  Plus,
  ArrowRight,
  MessageCircle,
  ThumbsUp,
  Sparkles,
} from "lucide-react";

// Every country in the world with flag + continent
const ALL_COUNTRIES = [
  // Africa
  { name: "Algeria", flag: "🇩🇿", continent: "Africa" },
  { name: "Angola", flag: "🇦🇴", continent: "Africa" },
  { name: "Benin", flag: "🇧🇯", continent: "Africa" },
  { name: "Botswana", flag: "🇧🇼", continent: "Africa" },
  { name: "Burkina Faso", flag: "🇧🇫", continent: "Africa" },
  { name: "Burundi", flag: "🇧🇮", continent: "Africa" },
  { name: "Cameroon", flag: "🇨🇲", continent: "Africa" },
  { name: "Cape Verde", flag: "🇨🇻", continent: "Africa" },
  { name: "Central African Republic", flag: "🇨🇫", continent: "Africa" },
  { name: "Chad", flag: "🇹🇩", continent: "Africa" },
  { name: "Comoros", flag: "🇰🇲", continent: "Africa" },
  { name: "Congo", flag: "🇨🇬", continent: "Africa" },
  { name: "DR Congo", flag: "🇨🇩", continent: "Africa" },
  { name: "Djibouti", flag: "🇩🇯", continent: "Africa" },
  { name: "Egypt", flag: "🇪🇬", continent: "Africa" },
  { name: "Equatorial Guinea", flag: "🇬🇶", continent: "Africa" },
  { name: "Eritrea", flag: "🇪🇷", continent: "Africa" },
  { name: "Eswatini", flag: "🇸🇿", continent: "Africa" },
  { name: "Ethiopia", flag: "🇪🇹", continent: "Africa" },
  { name: "Gabon", flag: "🇬🇦", continent: "Africa" },
  { name: "Gambia", flag: "🇬🇲", continent: "Africa" },
  { name: "Ghana", flag: "🇬🇭", continent: "Africa" },
  { name: "Guinea", flag: "🇬🇳", continent: "Africa" },
  { name: "Guinea-Bissau", flag: "🇬🇼", continent: "Africa" },
  { name: "Ivory Coast", flag: "🇨🇮", continent: "Africa" },
  { name: "Kenya", flag: "🇰🇪", continent: "Africa" },
  { name: "Lesotho", flag: "🇱🇸", continent: "Africa" },
  { name: "Liberia", flag: "🇱🇷", continent: "Africa" },
  { name: "Libya", flag: "🇱🇾", continent: "Africa" },
  { name: "Madagascar", flag: "🇲🇬", continent: "Africa" },
  { name: "Malawi", flag: "🇲🇼", continent: "Africa" },
  { name: "Mali", flag: "🇲🇱", continent: "Africa" },
  { name: "Mauritania", flag: "🇲🇷", continent: "Africa" },
  { name: "Mauritius", flag: "🇲🇺", continent: "Africa" },
  { name: "Morocco", flag: "🇲🇦", continent: "Africa" },
  { name: "Mozambique", flag: "🇲🇿", continent: "Africa" },
  { name: "Namibia", flag: "🇳🇦", continent: "Africa" },
  { name: "Niger", flag: "🇳🇪", continent: "Africa" },
  { name: "Nigeria", flag: "🇳🇬", continent: "Africa" },
  { name: "Rwanda", flag: "🇷🇼", continent: "Africa" },
  { name: "São Tomé and Príncipe", flag: "🇸🇹", continent: "Africa" },
  { name: "Senegal", flag: "🇸🇳", continent: "Africa" },
  { name: "Seychelles", flag: "🇸🇨", continent: "Africa" },
  { name: "Sierra Leone", flag: "🇸🇱", continent: "Africa" },
  { name: "Somalia", flag: "🇸🇴", continent: "Africa" },
  { name: "South Africa", flag: "🇿🇦", continent: "Africa" },
  { name: "South Sudan", flag: "🇸🇸", continent: "Africa" },
  { name: "Sudan", flag: "🇸🇩", continent: "Africa" },
  { name: "Tanzania", flag: "🇹🇿", continent: "Africa" },
  { name: "Togo", flag: "🇹🇬", continent: "Africa" },
  { name: "Tunisia", flag: "🇹🇳", continent: "Africa" },
  { name: "Uganda", flag: "🇺🇬", continent: "Africa" },
  { name: "Zambia", flag: "🇿🇲", continent: "Africa" },
  { name: "Zimbabwe", flag: "🇿🇼", continent: "Africa" },
  // Asia
  { name: "Afghanistan", flag: "🇦🇫", continent: "Asia" },
  { name: "Armenia", flag: "🇦🇲", continent: "Asia" },
  { name: "Azerbaijan", flag: "🇦🇿", continent: "Asia" },
  { name: "Bahrain", flag: "🇧🇭", continent: "Asia" },
  { name: "Bangladesh", flag: "🇧🇩", continent: "Asia" },
  { name: "Bhutan", flag: "🇧🇹", continent: "Asia" },
  { name: "Brunei", flag: "🇧🇳", continent: "Asia" },
  { name: "Cambodia", flag: "🇰🇭", continent: "Asia" },
  { name: "China", flag: "🇨🇳", continent: "Asia" },
  { name: "Cyprus", flag: "🇨🇾", continent: "Asia" },
  { name: "Georgia", flag: "🇬🇪", continent: "Asia" },
  { name: "Hong Kong", flag: "🇭🇰", continent: "Asia" },
  { name: "India", flag: "🇮🇳", continent: "Asia" },
  { name: "Indonesia", flag: "🇮🇩", continent: "Asia" },
  { name: "Iran", flag: "🇮🇷", continent: "Asia" },
  { name: "Iraq", flag: "🇮🇶", continent: "Asia" },
  { name: "Israel", flag: "🇮🇱", continent: "Asia" },
  { name: "Japan", flag: "🇯🇵", continent: "Asia" },
  { name: "Jordan", flag: "🇯🇴", continent: "Asia" },
  { name: "Kazakhstan", flag: "🇰🇿", continent: "Asia" },
  { name: "Kuwait", flag: "🇰🇼", continent: "Asia" },
  { name: "Kyrgyzstan", flag: "🇰🇬", continent: "Asia" },
  { name: "Laos", flag: "🇱🇦", continent: "Asia" },
  { name: "Lebanon", flag: "🇱🇧", continent: "Asia" },
  { name: "Malaysia", flag: "🇲🇾", continent: "Asia" },
  { name: "Maldives", flag: "🇲🇻", continent: "Asia" },
  { name: "Mongolia", flag: "🇲🇳", continent: "Asia" },
  { name: "Myanmar", flag: "🇲🇲", continent: "Asia" },
  { name: "Nepal", flag: "🇳🇵", continent: "Asia" },
  { name: "North Korea", flag: "🇰🇵", continent: "Asia" },
  { name: "Oman", flag: "🇴🇲", continent: "Asia" },
  { name: "Pakistan", flag: "🇵🇰", continent: "Asia" },
  { name: "Palestine", flag: "🇵🇸", continent: "Asia" },
  { name: "Philippines", flag: "🇵🇭", continent: "Asia" },
  { name: "Qatar", flag: "🇶🇦", continent: "Asia" },
  { name: "Saudi Arabia", flag: "🇸🇦", continent: "Asia" },
  { name: "Singapore", flag: "🇸🇬", continent: "Asia" },
  { name: "South Korea", flag: "🇰🇷", continent: "Asia" },
  { name: "Sri Lanka", flag: "🇱🇰", continent: "Asia" },
  { name: "Syria", flag: "🇸🇾", continent: "Asia" },
  { name: "Taiwan", flag: "🇹🇼", continent: "Asia" },
  { name: "Tajikistan", flag: "🇹🇯", continent: "Asia" },
  { name: "Thailand", flag: "🇹🇭", continent: "Asia" },
  { name: "Timor-Leste", flag: "🇹🇱", continent: "Asia" },
  { name: "Turkey", flag: "🇹🇷", continent: "Asia" },
  { name: "Turkmenistan", flag: "🇹🇲", continent: "Asia" },
  { name: "United Arab Emirates", flag: "🇦🇪", continent: "Asia" },
  { name: "Uzbekistan", flag: "🇺🇿", continent: "Asia" },
  { name: "Vietnam", flag: "🇻🇳", continent: "Asia" },
  { name: "Yemen", flag: "🇾🇪", continent: "Asia" },
  // Europe
  { name: "Albania", flag: "🇦🇱", continent: "Europe" },
  { name: "Andorra", flag: "🇦🇩", continent: "Europe" },
  { name: "Austria", flag: "🇦🇹", continent: "Europe" },
  { name: "Belarus", flag: "🇧🇾", continent: "Europe" },
  { name: "Belgium", flag: "🇧🇪", continent: "Europe" },
  { name: "Bosnia and Herzegovina", flag: "🇧🇦", continent: "Europe" },
  { name: "Bulgaria", flag: "🇧🇬", continent: "Europe" },
  { name: "Croatia", flag: "🇭🇷", continent: "Europe" },
  { name: "Czech Republic", flag: "🇨🇿", continent: "Europe" },
  { name: "Denmark", flag: "🇩🇰", continent: "Europe" },
  { name: "Estonia", flag: "🇪🇪", continent: "Europe" },
  { name: "Finland", flag: "🇫🇮", continent: "Europe" },
  { name: "France", flag: "🇫🇷", continent: "Europe" },
  { name: "Germany", flag: "🇩🇪", continent: "Europe" },
  { name: "Greece", flag: "🇬🇷", continent: "Europe" },
  { name: "Hungary", flag: "🇭🇺", continent: "Europe" },
  { name: "Iceland", flag: "🇮🇸", continent: "Europe" },
  { name: "Ireland", flag: "🇮🇪", continent: "Europe" },
  { name: "Italy", flag: "🇮🇹", continent: "Europe" },
  { name: "Kosovo", flag: "🇽🇰", continent: "Europe" },
  { name: "Latvia", flag: "🇱🇻", continent: "Europe" },
  { name: "Liechtenstein", flag: "🇱🇮", continent: "Europe" },
  { name: "Lithuania", flag: "🇱🇹", continent: "Europe" },
  { name: "Luxembourg", flag: "🇱🇺", continent: "Europe" },
  { name: "Malta", flag: "🇲🇹", continent: "Europe" },
  { name: "Moldova", flag: "🇲🇩", continent: "Europe" },
  { name: "Monaco", flag: "🇲🇨", continent: "Europe" },
  { name: "Montenegro", flag: "🇲🇪", continent: "Europe" },
  { name: "Netherlands", flag: "🇳🇱", continent: "Europe" },
  { name: "North Macedonia", flag: "🇲🇰", continent: "Europe" },
  { name: "Norway", flag: "🇳🇴", continent: "Europe" },
  { name: "Poland", flag: "🇵🇱", continent: "Europe" },
  { name: "Portugal", flag: "🇵🇹", continent: "Europe" },
  { name: "Romania", flag: "🇷🇴", continent: "Europe" },
  { name: "Russia", flag: "🇷🇺", continent: "Europe" },
  { name: "San Marino", flag: "🇸🇲", continent: "Europe" },
  { name: "Serbia", flag: "🇷🇸", continent: "Europe" },
  { name: "Slovakia", flag: "🇸🇰", continent: "Europe" },
  { name: "Slovenia", flag: "🇸🇮", continent: "Europe" },
  { name: "Spain", flag: "🇪🇸", continent: "Europe" },
  { name: "Sweden", flag: "🇸🇪", continent: "Europe" },
  { name: "Switzerland", flag: "🇨🇭", continent: "Europe" },
  { name: "Ukraine", flag: "🇺🇦", continent: "Europe" },
  { name: "United Kingdom", flag: "🇬🇧", continent: "Europe" },
  { name: "Vatican City", flag: "🇻🇦", continent: "Europe" },
  // North America
  { name: "Antigua and Barbuda", flag: "🇦🇬", continent: "North America" },
  { name: "Bahamas", flag: "🇧🇸", continent: "North America" },
  { name: "Barbados", flag: "🇧🇧", continent: "North America" },
  { name: "Belize", flag: "🇧🇿", continent: "North America" },
  { name: "Canada", flag: "🇨🇦", continent: "North America" },
  { name: "Costa Rica", flag: "🇨🇷", continent: "North America" },
  { name: "Cuba", flag: "🇨🇺", continent: "North America" },
  { name: "Dominica", flag: "🇩🇲", continent: "North America" },
  { name: "Dominican Republic", flag: "🇩🇴", continent: "North America" },
  { name: "El Salvador", flag: "🇸🇻", continent: "North America" },
  { name: "Grenada", flag: "🇬🇩", continent: "North America" },
  { name: "Guatemala", flag: "🇬🇹", continent: "North America" },
  { name: "Haiti", flag: "🇭🇹", continent: "North America" },
  { name: "Honduras", flag: "🇭🇳", continent: "North America" },
  { name: "Jamaica", flag: "🇯🇲", continent: "North America" },
  { name: "Mexico", flag: "🇲🇽", continent: "North America" },
  { name: "Nicaragua", flag: "🇳🇮", continent: "North America" },
  { name: "Panama", flag: "🇵🇦", continent: "North America" },
  { name: "Saint Kitts and Nevis", flag: "🇰🇳", continent: "North America" },
  { name: "Saint Lucia", flag: "🇱🇨", continent: "North America" },
  {
    name: "Saint Vincent and the Grenadines",
    flag: "🇻🇨",
    continent: "North America",
  },
  { name: "Trinidad and Tobago", flag: "🇹🇹", continent: "North America" },
  { name: "United States", flag: "🇺🇸", continent: "North America" },
  // South America
  { name: "Argentina", flag: "🇦🇷", continent: "South America" },
  { name: "Bolivia", flag: "🇧🇴", continent: "South America" },
  { name: "Brazil", flag: "🇧🇷", continent: "South America" },
  { name: "Chile", flag: "🇨🇱", continent: "South America" },
  { name: "Colombia", flag: "🇨🇴", continent: "South America" },
  { name: "Ecuador", flag: "🇪🇨", continent: "South America" },
  { name: "Guyana", flag: "🇬🇾", continent: "South America" },
  { name: "Paraguay", flag: "🇵🇾", continent: "South America" },
  { name: "Peru", flag: "🇵🇪", continent: "South America" },
  { name: "Suriname", flag: "🇸🇷", continent: "South America" },
  { name: "Uruguay", flag: "🇺🇾", continent: "South America" },
  { name: "Venezuela", flag: "🇻🇪", continent: "South America" },
  // Oceania
  { name: "Australia", flag: "🇦🇺", continent: "Oceania" },
  { name: "Fiji", flag: "🇫🇯", continent: "Oceania" },
  { name: "Kiribati", flag: "🇰🇮", continent: "Oceania" },
  { name: "Marshall Islands", flag: "🇲🇭", continent: "Oceania" },
  { name: "Micronesia", flag: "🇫🇲", continent: "Oceania" },
  { name: "Nauru", flag: "🇳🇷", continent: "Oceania" },
  { name: "New Zealand", flag: "🇳🇿", continent: "Oceania" },
  { name: "Palau", flag: "🇵🇼", continent: "Oceania" },
  { name: "Papua New Guinea", flag: "🇵🇬", continent: "Oceania" },
  { name: "Samoa", flag: "🇼🇸", continent: "Oceania" },
  { name: "Solomon Islands", flag: "🇸🇧", continent: "Oceania" },
  { name: "Tonga", flag: "🇹🇴", continent: "Oceania" },
  { name: "Tuvalu", flag: "🇹🇻", continent: "Oceania" },
  { name: "Vanuatu", flag: "🇻🇺", continent: "Oceania" },
];

const CONTINENTS = [
  "All",
  "Europe",
  "Asia",
  "Africa",
  "North America",
  "South America",
  "Oceania",
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContinent, setSelectedContinent] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [placeSearch, setPlaceSearch] = useState("");
  const searchRef = useRef(null);

  // Fetch DB stats for countries that have data
  const { data: destData } = useQuery({
    queryKey: ["destinations-all"],
    queryFn: async () => {
      const res = await fetch("/api/destinations");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: tipsData } = useQuery({
    queryKey: ["tips-latest"],
    queryFn: async () => {
      const res = await fetch("/api/tips/trending?type=latest&limit=200");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  // When a country is selected, fetch its destinations
  const { data: countryDestData, isLoading: countryDestsLoading } = useQuery({
    queryKey: ["country-destinations", selectedCountry?.name, placeSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ country: selectedCountry.name });
      if (placeSearch.length >= 1) params.set("q", placeSearch);
      const res = await fetch(`/api/destinations/search?${params}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!selectedCountry,
  });

  const destinations = destData?.destinations || [];
  const tips = tipsData?.tips || [];

  // Build stats map for countries with DB data
  const countryStatsMap = {};
  destinations.forEach((d) => {
    const key = d.country.toLowerCase();
    if (!countryStatsMap[key]) countryStatsMap[key] = { places: 0, tips: 0 };
    countryStatsMap[key].places++;
  });
  tips.forEach((t) => {
    const key = (t.destination_country || "").toLowerCase();
    if (countryStatsMap[key]) countryStatsMap[key].tips++;
  });

  // Merge all countries with stats
  const countriesWithStats = ALL_COUNTRIES.map((c) => {
    const stats = countryStatsMap[c.name.toLowerCase()] || {
      places: 0,
      tips: 0,
    };
    return { ...c, ...stats };
  });

  // Filter
  const filtered = countriesWithStats.filter((c) => {
    const matchesSearch = c.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesContinent =
      selectedContinent === "All" || c.continent === selectedContinent;
    return matchesSearch && matchesContinent;
  });

  // Sort: countries with tips first, then with places, then alphabetical
  const sorted = [...filtered].sort((a, b) => {
    if (b.tips !== a.tips) return b.tips - a.tips;
    if (b.places !== a.places) return b.places - a.places;
    return a.name.localeCompare(b.name);
  });

  const hotCountries = sorted
    .filter((c) => c.tips > 0 || c.places > 0)
    .slice(0, 6);
  const countryDests = countryDestData?.destinations || [];

  // Country detail view
  if (selectedCountry) {
    return (
      <div className="min-h-screen bg-[#F4F6F8]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] px-5 md:px-8 py-6">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => {
                setSelectedCountry(null);
                setPlaceSearch("");
              }}
              className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-bold">All Countries</span>
            </button>
            <div className="flex items-center gap-4 mb-5">
              <span className="text-6xl">{selectedCountry.flag}</span>
              <div>
                <h1 className="text-3xl font-black text-white">
                  {selectedCountry.name}
                </h1>
                <p className="text-white/70 text-sm font-semibold">
                  {selectedCountry.continent} • {countryDests.length} places
                </p>
              </div>
            </div>
            {/* Place search */}
            <div className="bg-white rounded-2xl flex items-center px-4 py-3 shadow-lg border border-gray-100">
              <Search className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={placeSearch}
                onChange={(e) => setPlaceSearch(e.target.value)}
                placeholder={`Search for a place in ${selectedCountry.name}...`}
                className="flex-1 ml-3 text-base font-semibold text-[#1E1E1E] outline-none placeholder-gray-400"
                autoFocus
              />
              {placeSearch && (
                <button onClick={() => setPlaceSearch("")}>
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-5 md:px-8 py-8 pb-24">
          {/* Existing places */}
          {countryDestsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div
                className="w-10 h-10 border-[3px] border-gray-200 border-t-[#008C8F] rounded-full"
                style={{ animation: "spin .8s linear infinite" }}
              ></div>
            </div>
          ) : countryDests.length > 0 ? (
            <div>
              <div className="flex items-center gap-2 mb-5">
                <MapPin className="w-5 h-5 text-[#008C8F]" />
                <h2 className="text-xl font-black text-[#1E1E1E]">
                  Places in {selectedCountry.name}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {countryDests.map((dest) => (
                  <div
                    key={dest.id}
                    className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-[#7DE2D1] transition-all shadow-sm"
                  >
                    {dest.image_url && (
                      <img
                        src={dest.image_url}
                        alt={dest.name}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-[#1E1E1E] mb-1">
                        {dest.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {dest.tip_count || 0} tips
                      </p>
                      {dest.description && (
                        <p className="text-sm text-gray-700 line-clamp-2 mb-4">
                          {dest.description}
                        </p>
                      )}
                      <a
                        href={`/add-tip?destination=${dest.id}`}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] text-white px-4 py-2 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-teal-500/20 transition-all"
                      >
                        <Plus className="w-4 h-4" /> Leave a Tip
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">{selectedCountry.flag}</div>
              <h3 className="text-xl font-bold text-[#1E1E1E] mb-2">
                No places in {selectedCountry.name} yet
              </h3>
              <p className="text-gray-600 mb-6">
                Be the first to add a place and share your tips!
              </p>
            </div>
          )}

          {/* Add a new place CTA */}
          <div className="mt-8 bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-[#7DE2D1] transition-all shadow-sm">
            <div className="text-4xl mb-3">📍</div>
            <h3 className="text-lg font-bold text-[#1E1E1E] mb-2">
              Don't see your place?
            </h3>
            <p className="text-sm text-gray-600 mb-5">
              Add any city, town, or destination in {selectedCountry.name} and
              leave a tip!
            </p>
            <a
              href={`/add-tip?country=${encodeURIComponent(selectedCountry.name)}`}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-teal-500/20 transition-all"
            >
              <Plus className="w-5 h-5" /> Add a Place & Tip
            </a>
          </div>
        </div>

        <style
          jsx
          global
        >{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Main explore view
  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] px-5 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <a href="/add-tip" title="Share a tip">
              <img
                src="https://ucarecdn.com/863a610b-33d3-402a-95c2-addeacf4716f/-/format/auto/"
                alt="TipTrip"
                className="w-auto object-contain cursor-pointer hover:opacity-90 transition-all"
                style={{ height: "160px" }}
              />
            </a>
          </div>

          {/* Search */}
          <div className="bg-white rounded-2xl flex items-center px-4 py-3 shadow-lg border border-gray-100">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any country..."
              className="flex-1 ml-3 text-base font-semibold text-[#1E1E1E] outline-none placeholder-gray-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-8 pb-24">
        {/* Continent filter */}
        <div className="flex items-center gap-2 mt-6 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {CONTINENTS.map((c) => {
            const isActive = selectedContinent === c;
            return (
              <button
                key={c}
                onClick={() => setSelectedContinent(c)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${isActive ? "bg-[#008C8F] text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"}`}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* Hot destinations (only if no search & "All" filter) */}
        {!searchQuery &&
          selectedContinent === "All" &&
          hotCountries.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <Flame className="w-6 h-6 text-[#008C8F] fill-[#008C8F]" />
                <h2 className="text-2xl font-black text-[#1E1E1E]">
                  Hottest Destinations
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hotCountries.map((country, index) => (
                  <button
                    key={country.name}
                    onClick={() => setSelectedCountry(country)}
                    className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg hover:border-[#7DE2D1] transition-all text-left relative shadow-sm"
                  >
                    {index < 3 && (
                      <div className="absolute top-3 right-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${index === 0 ? "bg-gradient-to-r from-[#F59E0B] to-[#D97706]" : index === 1 ? "bg-gradient-to-r from-[#94A3B8] to-[#64748B]" : "bg-gradient-to-r from-[#CD7F32] to-[#A0522D]"}`}
                        >
                          <span className="text-xs font-black text-white">
                            {index + 1}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="text-5xl mb-3">{country.flag}</div>
                    <h3 className="text-lg font-extrabold text-[#1E1E1E] mb-2 truncate">
                      {country.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="bg-[#008C8F] px-3 py-1 rounded-lg text-xs font-extrabold text-white">
                        {country.tips} tips
                      </span>
                      <span className="text-xs text-gray-600 font-semibold">
                        {country.places} places
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

        {/* All Countries Grid */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <Globe className="w-6 h-6 text-[#7DE2D1]" />
            <h2 className="text-2xl font-black text-[#1E1E1E]">
              {searchQuery
                ? `Results for "${searchQuery}"`
                : selectedContinent === "All"
                  ? "All Countries"
                  : selectedContinent}
            </h2>
            <span className="bg-white text-gray-600 px-3 py-1 rounded-lg text-xs font-bold border border-gray-100">
              {sorted.length}
            </span>
          </div>

          {sorted.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-[#1E1E1E] mb-2">
                No countries found
              </h3>
              <p className="text-gray-600">Try a different search or filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {sorted.map((country) => {
                const hasTips = country.tips > 0;
                const hasPlaces = country.places > 0;
                return (
                  <button
                    key={country.name}
                    onClick={() => setSelectedCountry(country)}
                    className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-lg hover:border-[#7DE2D1] transition-all text-left group shadow-sm relative"
                  >
                    <div className="text-4xl mb-2">{country.flag}</div>
                    <h3 className="text-sm font-bold text-[#1E1E1E] truncate group-hover:text-[#008C8F] transition-colors">
                      {country.name}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {hasTips
                        ? `${country.tips} tips`
                        : hasPlaces
                          ? `${country.places} places`
                          : "No tips yet"}
                    </p>
                    {hasTips && (
                      <div className="w-2 h-2 rounded-full bg-[#008C8F] absolute top-3 right-3"></div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
