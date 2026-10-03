import { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  Globe,
  Search,
  MapPin,
  Flame,
  X,
  Plus,
  ChevronLeft,
  ArrowRight,
} from "lucide-react-native";

const { width: screenWidth } = Dimensions.get("window");

const ALL_COUNTRIES = [
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

const CONTINENTS = ["All", "Europe", "Asia", "Africa", "Americas", "Oceania"];
const cardWidth = (screenWidth - 52) / 3;

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContinent, setSelectedContinent] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [placeSearch, setPlaceSearch] = useState("");

  // Fetch DB stats
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

  // Build stats map
  const countryStatsMap = useMemo(() => {
    const map = {};
    destinations.forEach((d) => {
      const key = d.country.toLowerCase();
      if (!map[key]) map[key] = { places: 0, tips: 0 };
      map[key].places++;
    });
    tips.forEach((t) => {
      const key = (t.destination_country || "").toLowerCase();
      if (map[key]) map[key].tips++;
    });
    return map;
  }, [destinations, tips]);

  const countriesWithStats = useMemo(() => {
    return ALL_COUNTRIES.map((c) => {
      const stats = countryStatsMap[c.name.toLowerCase()] || {
        places: 0,
        tips: 0,
      };
      return { ...c, ...stats };
    });
  }, [countryStatsMap]);

  const filtered = useMemo(() => {
    return countriesWithStats.filter((c) => {
      const matchesSearch = c.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesContinent =
        selectedContinent === "All" ||
        c.continent === selectedContinent ||
        (selectedContinent === "Americas" &&
          (c.continent === "North America" || c.continent === "South America"));
      return matchesSearch && matchesContinent;
    });
  }, [countriesWithStats, searchQuery, selectedContinent]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (b.tips !== a.tips) return b.tips - a.tips;
      if (b.places !== a.places) return b.places - a.places;
      return a.name.localeCompare(b.name);
    });
  }, [filtered]);

  const hotCountries = sorted
    .filter((c) => c.tips > 0 || c.places > 0)
    .slice(0, 6);
  const countryDests = countryDestData?.destinations || [];

  // ====== COUNTRY DETAIL VIEW ======
  if (selectedCountry) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F4F6F8" }}>
        <StatusBar style="dark" />
        <LinearGradient
          colors={["#008C8F", "#7DE2D1"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: insets.top + 8,
            paddingHorizontal: 20,
            paddingBottom: 20,
          }}
        >
          {/* Back button */}
          <TouchableOpacity
            onPress={() => {
              setSelectedCountry(null);
              setPlaceSearch("");
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginBottom: 16,
            }}
          >
            <ChevronLeft size={20} color="rgba(255,255,255,0.8)" />
            <Text
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: 14,
                fontWeight: "700",
              }}
            >
              All Countries
            </Text>
          </TouchableOpacity>

          {/* Country info */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 56 }}>{selectedCountry.flag}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 26, fontWeight: "900", color: "#fff" }}>
                {selectedCountry.name}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.7)",
                  fontWeight: "600",
                }}
              >
                {selectedCountry.continent} • {countryDests.length} places
              </Text>
            </View>
          </View>

          {/* Place search */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 14,
              paddingVertical: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Search size={18} color="#6B7280" />
            <TextInput
              value={placeSearch}
              onChangeText={setPlaceSearch}
              placeholder={`Search places in ${selectedCountry.name}...`}
              placeholderTextColor="#9CA3AF"
              style={{
                flex: 1,
                marginLeft: 10,
                fontSize: 15,
                color: "#1E1E1E",
                fontWeight: "600",
              }}
            />
            {placeSearch.length > 0 && (
              <TouchableOpacity onPress={() => setPlaceSearch("")}>
                <X size={18} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: insets.bottom + 100,
          }}
          showsVerticalScrollIndicator={false}
        >
          {countryDestsLoading ? (
            <ActivityIndicator
              size="large"
              color="#008C8F"
              style={{ marginTop: 40 }}
            />
          ) : countryDests.length > 0 ? (
            <View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <MapPin size={18} color="#008C8F" />
                <Text
                  style={{ fontSize: 18, fontWeight: "900", color: "#1E1E1E" }}
                >
                  Places in {selectedCountry.name}
                </Text>
              </View>

              {countryDests.map((dest) => (
                <View
                  key={dest.id}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 16,
                    overflow: "hidden",
                    marginBottom: 14,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  {dest.image_url && (
                    <Image
                      source={{ uri: dest.image_url }}
                      style={{ width: "100%", height: 160 }}
                      contentFit="cover"
                      transition={200}
                    />
                  )}
                  <View style={{ padding: 16 }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "800",
                        color: "#1E1E1E",
                        marginBottom: 4,
                      }}
                    >
                      {dest.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#6B7280",
                        marginBottom: 8,
                      }}
                    >
                      {dest.tip_count || 0} tips
                    </Text>
                    {dest.description && (
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#4B5563",
                          lineHeight: 20,
                          marginBottom: 12,
                        }}
                        numberOfLines={2}
                      >
                        {dest.description}
                      </Text>
                    )}
                    <TouchableOpacity
                      onPress={() =>
                        router.push(`/(tabs)/add-tip?destination=${dest.id}`)
                      }
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={["#008C8F", "#7DE2D1"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          borderRadius: 12,
                          alignSelf: "flex-start",
                        }}
                      >
                        <Plus size={16} color="#fff" />
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 13,
                            fontWeight: "800",
                          }}
                        >
                          Leave a Tip
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <Text style={{ fontSize: 56, marginBottom: 12 }}>
                {selectedCountry.flag}
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: "#1E1E1E",
                  marginBottom: 6,
                }}
              >
                No places in {selectedCountry.name} yet
              </Text>
              <Text
                style={{ fontSize: 14, color: "#6B7280", textAlign: "center" }}
              >
                Be the first to add a place and share your tips!
              </Text>
            </View>
          )}

          {/* Add new place CTA */}
          <TouchableOpacity
            onPress={() =>
              router.push(
                `/(tabs)/add-tip?country=${encodeURIComponent(selectedCountry.name)}`,
              )
            }
            activeOpacity={0.8}
            style={{
              marginTop: 20,
              borderRadius: 16,
              borderWidth: 2,
              borderStyle: "dashed",
              borderColor: "#D1D5DB",
              backgroundColor: "#FFFFFF",
              padding: 24,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Text style={{ fontSize: 36, marginBottom: 8 }}>📍</Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "800",
                color: "#1E1E1E",
                marginBottom: 4,
              }}
            >
              Don't see your place?
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "#6B7280",
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              Add any city, town, or destination in {selectedCountry.name} and
              leave a tip!
            </Text>
            <LinearGradient
              colors={["#008C8F", "#7DE2D1"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 14,
              }}
            >
              <Plus size={18} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "800" }}>
                Add a Place & Tip
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ====== MAIN EXPLORE VIEW ======
  return (
    <View style={{ flex: 1, backgroundColor: "#F4F6F8" }}>
      <StatusBar style="dark" />

      {/* Header */}
      <LinearGradient
        colors={["#008C8F", "#7DE2D1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 30,
                fontWeight: "900",
                color: "#fff",
                marginBottom: 4,
              }}
            >
              Explore 🌍
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.8)",
                fontWeight: "600",
              }}
            >
              {ALL_COUNTRIES.length} countries to discover
            </Text>
          </View>
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              padding: 12,
              borderRadius: 14,
            }}
          >
            <Globe size={26} color="#fff" />
          </View>
        </View>

        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 14,
            paddingVertical: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Search size={18} color="#6B7280" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search any country..."
            placeholderTextColor="#9CA3AF"
            style={{
              flex: 1,
              marginLeft: 10,
              fontSize: 15,
              color: "#1E1E1E",
              fontWeight: "600",
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={18} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Continent Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0, marginTop: 16 }}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        >
          {CONTINENTS.map((c) => {
            const isActive = selectedContinent === c;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => setSelectedContinent(c)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 12,
                  backgroundColor: isActive ? "#008C8F" : "#FFFFFF",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isActive ? 0.15 : 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: isActive ? "#fff" : "#6B7280",
                  }}
                >
                  {c}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Hot Countries */}
        {!searchQuery &&
          selectedContinent === "All" &&
          hotCountries.length > 0 && (
            <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <Flame size={20} color="#008C8F" fill="#008C8F" />
                <Text
                  style={{ fontSize: 18, fontWeight: "900", color: "#1E1E1E" }}
                >
                  Hottest Destinations
                </Text>
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {hotCountries.map((country, index) => (
                  <TouchableOpacity
                    key={country.name}
                    onPress={() => setSelectedCountry(country)}
                    activeOpacity={0.8}
                    style={{ width: (screenWidth - 50) / 2 }}
                  >
                    <View
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: 16,
                        padding: 16,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        elevation: 2,
                      }}
                    >
                      {index < 3 && (
                        <View
                          style={{ position: "absolute", top: 10, right: 10 }}
                        >
                          <LinearGradient
                            colors={
                              index === 0
                                ? ["#F59E0B", "#D97706"]
                                : index === 1
                                  ? ["#94A3B8", "#64748B"]
                                  : ["#CD7F32", "#A0522D"]
                            }
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 11,
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 11,
                                fontWeight: "900",
                                color: "#fff",
                              }}
                            >
                              {index + 1}
                            </Text>
                          </LinearGradient>
                        </View>
                      )}
                      <Text style={{ fontSize: 40, marginBottom: 6 }}>
                        {country.flag}
                      </Text>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "800",
                          color: "#1E1E1E",
                          marginBottom: 4,
                        }}
                        numberOfLines={1}
                      >
                        {country.name}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: "#008C8F",
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 8,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: "800",
                              color: "#fff",
                            }}
                          >
                            {country.tips} tips
                          </Text>
                        </View>
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#6B7280",
                            fontWeight: "600",
                          }}
                        >
                          {country.places} places
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

        {/* All Countries Grid */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
            }}
          >
            <Globe size={20} color="#7DE2D1" />
            <Text style={{ fontSize: 18, fontWeight: "900", color: "#1E1E1E" }}>
              {searchQuery
                ? `"${searchQuery}"`
                : selectedContinent === "All"
                  ? "All Countries"
                  : selectedContinent}
            </Text>
            <View
              style={{
                backgroundColor: "#FFFFFF",
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <Text
                style={{ fontSize: 11, fontWeight: "700", color: "#6B7280" }}
              >
                {sorted.length}
              </Text>
            </View>
          </View>

          {sorted.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🔍</Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#1E1E1E",
                  marginBottom: 4,
                }}
              >
                No countries found
              </Text>
              <Text style={{ fontSize: 13, color: "#6B7280" }}>
                Try a different search
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {sorted.map((country) => {
                const hasTips = country.tips > 0;
                const hasPlaces = country.places > 0;
                const subtitle = hasTips
                  ? `${country.tips} tips`
                  : hasPlaces
                    ? `${country.places} places`
                    : "No tips yet";

                return (
                  <TouchableOpacity
                    key={country.name}
                    onPress={() => setSelectedCountry(country)}
                    activeOpacity={0.8}
                    style={{
                      width: cardWidth,
                      backgroundColor: "#FFFFFF",
                      borderRadius: 14,
                      padding: 12,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  >
                    <Text style={{ fontSize: 32, marginBottom: 4 }}>
                      {country.flag}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: "#1E1E1E",
                      }}
                      numberOfLines={1}
                    >
                      {country.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        color: hasTips ? "#008C8F" : "#6B7280",
                        marginTop: 2,
                        fontWeight: "600",
                      }}
                    >
                      {subtitle}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
