import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Bus,
  DollarSign,
  Ship,
  Plane,
  Camera,
  Clock,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Navigation,
  Hotel,
  Ticket,
  Car,
  Shield,
  Globe,
  ExternalLink,
} from "lucide-react-native";

const CATEGORY_CONFIG = {
  flights: { label: "Flights", emoji: "✈️", color: "#3B82F6", icon: Plane },
  hotels: { label: "Hotels", emoji: "🏨", color: "#8B5CF6", icon: Hotel },
  activities: {
    label: "Tours & Activities",
    emoji: "🎫",
    color: "#10B981",
    icon: Ticket,
  },
  car_rental: { label: "Car Rental", emoji: "🚗", color: "#F59E0B", icon: Car },
  insurance: {
    label: "Travel Insurance",
    emoji: "🛡️",
    color: "#EF4444",
    icon: Shield,
  },
  multi: { label: "Multi-Service", emoji: "🌍", color: "#06B6D4", icon: Globe },
};

export default function DestinationDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [destination, setDestination] = useState(null);
  const [tips, setTips] = useState([]);
  const [cruiseTips, setCruiseTips] = useState([]);
  const [airportTips, setAirportTips] = useState([]);
  const [affiliateLinks, setAffiliateLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDestinationData();
  }, [id]);

  const fetchDestinationData = async () => {
    try {
      const [destRes, tipsRes] = await Promise.all([
        fetch(`/api/destinations/${id}`),
        fetch(`/api/tips?destination_id=${id}`),
      ]);

      const destData = await destRes.json();
      const tipsData = await tipsRes.json();

      setDestination(destData.destination);
      setTips(tipsData.tips || []);

      // Fetch affiliate links for this destination
      if (destData.destination) {
        try {
          const affRes = await fetch(
            `/api/affiliates/links?destination=${encodeURIComponent(destData.destination.name)}&country=${encodeURIComponent(destData.destination.country)}`,
          );
          if (affRes.ok) {
            const affData = await affRes.json();
            setAffiliateLinks(affData.links || []);
          }
        } catch (e) {
          console.error("Error fetching affiliate links:", e);
        }
      }

      // Fetch cruise-specific or airport-specific data
      if (destData.destination?.destination_type === "cruise_port") {
        const cruiseRes = await fetch(`/api/cruise-tips?destination_id=${id}`);
        const cruiseData = await cruiseRes.json();
        setCruiseTips(cruiseData.tips || []);
      } else if (destData.destination?.destination_type === "airport") {
        const airportRes = await fetch(
          `/api/airport-tips?destination_id=${id}`,
        );
        const airportData = await airportRes.json();
        setAirportTips(airportData.tips || []);
      }
    } catch (error) {
      console.error("Error fetching destination:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingPress = (link) => {
    Linking.openURL(link.booking_url).catch((err) =>
      console.error("Error opening URL:", err),
    );
  };

  // Group affiliate links by category
  const groupedLinks = {};
  affiliateLinks.forEach((link) => {
    if (!groupedLinks[link.category]) groupedLinks[link.category] = [];
    groupedLinks[link.category].push(link);
  });

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0F172A",
        }}
      >
        <ActivityIndicator size="large" color="#FF006E" />
      </View>
    );
  }

  if (!destination) {
    return (
      <View
        style={{ flex: 1, backgroundColor: "#0F172A", paddingTop: insets.top }}
      >
        <Text style={{ color: "#FFF", textAlign: "center", marginTop: 20 }}>
          Destination not found
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0F172A" }}>
      <StatusBar style="light" />

      {/* Hero Image */}
      {destination.image_url && (
        <View style={{ height: 300, position: "relative" }}>
          <Image
            source={{ uri: destination.image_url }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={200}
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.6)", "transparent", "rgba(15,23,42,0.95)"]}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />

          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              position: "absolute",
              top: insets.top + 10,
              left: 16,
              backgroundColor: "rgba(0,0,0,0.5)",
              padding: 12,
              borderRadius: 12,
            }}
          >
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>

          {/* Destination Type Badge */}
          {destination.destination_type !== "city" && (
            <View
              style={{
                position: "absolute",
                top: insets.top + 10,
                right: 16,
              }}
            >
              <LinearGradient
                colors={
                  destination.destination_type === "cruise_port"
                    ? ["#3B82F6", "#1E40AF"]
                    : ["#8B5CF6", "#6D28D9"]
                }
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {destination.destination_type === "cruise_port" ? (
                  <Ship size={16} color="#FFF" />
                ) : (
                  <Plane size={16} color="#FFF" />
                )}
                <Text
                  style={{ fontSize: 12, fontWeight: "800", color: "#FFF" }}
                >
                  {destination.destination_type === "cruise_port"
                    ? "CRUISE PORT"
                    : "AIRPORT"}
                </Text>
              </LinearGradient>
            </View>
          )}

          {/* Title */}
          <View
            style={{
              position: "absolute",
              bottom: 20,
              left: 20,
              right: 20,
            }}
          >
            <Text
              style={{
                fontSize: 36,
                fontWeight: "900",
                color: "#FFF",
                marginBottom: 4,
                textShadowColor: "rgba(0,0,0,0.8)",
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 8,
              }}
            >
              {destination.name}
            </Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <MapPin size={16} color="#FCD34D" />
              <Text
                style={{
                  fontSize: 16,
                  color: "#FFF",
                  fontWeight: "600",
                  opacity: 0.95,
                }}
              >
                {destination.country}
              </Text>
            </View>
          </View>
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        {destination.description && (
          <View style={{ padding: 20 }}>
            <Text
              style={{
                fontSize: 16,
                color: "#CBD5E1",
                lineHeight: 24,
              }}
            >
              {destination.description}
            </Text>
          </View>
        )}

        {/* Book Your Trip Section */}
        {affiliateLinks.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <Sparkles size={20} color="#FF006E" />
              <Text style={{ fontSize: 20, fontWeight: "900", color: "#FFF" }}>
                Book Your Trip
              </Text>
            </View>

            {Object.entries(groupedLinks).map(([cat, links]) => {
              const config = CATEGORY_CONFIG[cat] || {
                label: cat,
                emoji: "📍",
                color: "#64748B",
              };
              return (
                <View key={cat} style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "800",
                      color: config.color,
                      marginBottom: 8,
                    }}
                  >
                    {config.emoji} {config.label}
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ flexGrow: 0 }}
                  >
                    {links.map((link) => (
                      <TouchableOpacity
                        key={link.id}
                        onPress={() => handleBookingPress(link)}
                        activeOpacity={0.8}
                        style={{
                          backgroundColor: "#1E293B",
                          borderRadius: 16,
                          padding: 14,
                          marginRight: 12,
                          minWidth: 150,
                          borderWidth: 1,
                          borderColor: "#334155",
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 6,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "800",
                              color: "#FFF",
                            }}
                          >
                            {link.partner_name}
                          </Text>
                          <ExternalLink size={12} color="#64748B" />
                        </View>
                        {link.commission_rate > 0 && (
                          <View
                            style={{
                              backgroundColor: config.color + "20",
                              paddingHorizontal: 8,
                              paddingVertical: 3,
                              borderRadius: 8,
                              alignSelf: "flex-start",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 10,
                                fontWeight: "700",
                                color: config.color,
                              }}
                            >
                              {link.has_affiliate_code
                                ? "✓ Linked"
                                : "Search " + destination.name}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              );
            })}
          </View>
        )}

        {/* Cruise Port Specific Info */}
        {destination.destination_type === "cruise_port" && (
          <View style={{ paddingHorizontal: 20 }}>
            <LinearGradient
              colors={["#1E3A8A", "#1E40AF"]}
              style={{
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <Ship size={24} color="#FFF" />
                <Text
                  style={{ fontSize: 20, fontWeight: "900", color: "#FFF" }}
                >
                  🚢 Cruise Terminal Info
                </Text>
              </View>
              {destination.cruise_terminal_info && (
                <Text
                  style={{ fontSize: 14, color: "#E0E7FF", lineHeight: 22 }}
                >
                  {destination.cruise_terminal_info}
                </Text>
              )}
            </LinearGradient>

            {/* Cruise-Specific Tips */}
            {cruiseTips.map((tip, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: "#1E293B",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 16,
                  borderLeftWidth: 4,
                  borderLeftColor: "#3B82F6",
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "800",
                    color: "#FFF",
                    marginBottom: 12,
                  }}
                >
                  {tip.cruise_line || "General Tips"}
                </Text>

                {tip.boarding_tips && (
                  <View style={{ marginBottom: 12 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 6,
                      }}
                    >
                      <Navigation size={16} color="#60A5FA" />
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: "#60A5FA",
                        }}
                      >
                        Boarding Hacks
                      </Text>
                    </View>
                    <Text
                      style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 20 }}
                    >
                      {tip.boarding_tips}
                    </Text>
                  </View>
                )}

                {tip.disembarkation_tips && (
                  <View style={{ marginBottom: 12 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 6,
                      }}
                    >
                      <ArrowLeft size={16} color="#34D399" />
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: "#34D399",
                        }}
                      >
                        Disembarkation Advice
                      </Text>
                    </View>
                    <Text
                      style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 20 }}
                    >
                      {tip.disembarkation_tips}
                    </Text>
                  </View>
                )}

                {tip.cabin_card_info && (
                  <View style={{ marginBottom: 12 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 6,
                      }}
                    >
                      <CreditCard size={16} color="#FCD34D" />
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: "#FCD34D",
                        }}
                      >
                        Cabin Card Explained
                      </Text>
                    </View>
                    <Text
                      style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 20 }}
                    >
                      {tip.cabin_card_info}
                    </Text>
                  </View>
                )}

                {tip.port_walkthrough && (
                  <View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 6,
                      }}
                    >
                      <MapPin size={16} color="#F472B6" />
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: "#F472B6",
                        }}
                      >
                        Port Walkthrough
                      </Text>
                    </View>
                    <Text
                      style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 20 }}
                    >
                      {tip.port_walkthrough}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Airport Specific Info */}
        {destination.destination_type === "airport" && (
          <View style={{ paddingHorizontal: 20 }}>
            {destination.airport_code && (
              <View
                style={{
                  backgroundColor: "#1E293B",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 16,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 48,
                    fontWeight: "900",
                    color: "#FF006E",
                    marginBottom: 4,
                  }}
                >
                  {destination.airport_code}
                </Text>
                <Text style={{ fontSize: 14, color: "#94A3B8" }}>
                  Airport Code
                </Text>
              </View>
            )}

            {/* Airport-Specific Tips */}
            {airportTips.map((tip, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: "#1E293B",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 16,
                  borderLeftWidth: 4,
                  borderLeftColor: "#8B5CF6",
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "800",
                    color: "#FFF",
                    marginBottom: 12,
                  }}
                >
                  ✈️ Airport Insider Tips
                </Text>

                {tip.terminal_walkthroughs && (
                  <View style={{ marginBottom: 12 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 6,
                      }}
                    >
                      <Navigation size={16} color="#A78BFA" />
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: "#A78BFA",
                        }}
                      >
                        Terminal Walkthrough
                      </Text>
                    </View>
                    <Text
                      style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 20 }}
                    >
                      {tip.terminal_walkthroughs}
                    </Text>
                  </View>
                )}

                {tip.security_tips && (
                  <View style={{ marginBottom: 12 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 6,
                      }}
                    >
                      <ShieldCheck size={16} color="#34D399" />
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: "#34D399",
                        }}
                      >
                        Security Tips
                      </Text>
                    </View>
                    <Text
                      style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 20 }}
                    >
                      {tip.security_tips}
                    </Text>
                  </View>
                )}

                {tip.lounge_access && (
                  <View style={{ marginBottom: 12 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 6,
                      }}
                    >
                      <Sparkles size={16} color="#FCD34D" />
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: "#FCD34D",
                        }}
                      >
                        Lounge Access
                      </Text>
                    </View>
                    <Text
                      style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 20 }}
                    >
                      {tip.lounge_access}
                    </Text>
                  </View>
                )}

                {tip.transport_to_city && (
                  <View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 6,
                      }}
                    >
                      <Bus size={16} color="#60A5FA" />
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: "#60A5FA",
                        }}
                      >
                        Transport to City
                      </Text>
                    </View>
                    <Text
                      style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 20 }}
                    >
                      {tip.transport_to_city}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Regular City Info */}
        {destination.destination_type === "city" && (
          <View style={{ paddingHorizontal: 20 }}>
            {/* Best Time to Visit */}
            {destination.best_time_to_visit && (
              <View style={{ marginBottom: 16 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  <Calendar size={20} color="#FF006E" />
                  <Text
                    style={{ fontSize: 18, fontWeight: "900", color: "#FFF" }}
                  >
                    📅 Best Time to Visit
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: "#1E293B",
                    borderRadius: 16,
                    padding: 16,
                    borderLeftWidth: 4,
                    borderLeftColor: "#FF006E",
                  }}
                >
                  <Text
                    style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 22 }}
                  >
                    {destination.best_time_to_visit}
                  </Text>
                </View>
              </View>
            )}

            {/* Transport Tips */}
            {destination.transport_tips && (
              <View style={{ marginBottom: 16 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  <Bus size={20} color="#3B82F6" />
                  <Text
                    style={{ fontSize: 18, fontWeight: "900", color: "#FFF" }}
                  >
                    🚌 Transport Tips
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: "#1E293B",
                    borderRadius: 16,
                    padding: 16,
                    borderLeftWidth: 4,
                    borderLeftColor: "#3B82F6",
                  }}
                >
                  <Text
                    style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 22 }}
                  >
                    {destination.transport_tips}
                  </Text>
                </View>
              </View>
            )}

            {/* Money Saving Tips */}
            {destination.money_saving_tips && (
              <View style={{ marginBottom: 16 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  <DollarSign size={20} color="#10B981" />
                  <Text
                    style={{ fontSize: 18, fontWeight: "900", color: "#FFF" }}
                  >
                    💰 Money-Saving Advice
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: "#1E293B",
                    borderRadius: 16,
                    padding: 16,
                    borderLeftWidth: 4,
                    borderLeftColor: "#10B981",
                  }}
                >
                  <Text
                    style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 22 }}
                  >
                    {destination.money_saving_tips}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* User Tips & Photos */}
        {tips.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <Camera size={20} color="#FF006E" />
              <Text style={{ fontSize: 18, fontWeight: "900", color: "#FFF" }}>
                📸 Traveler Tips & Photos
              </Text>
              <View
                style={{
                  backgroundColor: "#FF006E",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  marginLeft: 4,
                }}
              >
                <Text
                  style={{ fontSize: 12, fontWeight: "800", color: "#FFF" }}
                >
                  {tips.length}
                </Text>
              </View>
            </View>

            {tips.map((tip) => {
              const photos = [];
              if (tip.photo_url) photos.push(tip.photo_url);
              if (tip.photo_urls) {
                try {
                  const additionalPhotos = JSON.parse(tip.photo_urls);
                  additionalPhotos.forEach((url) => {
                    if (!photos.includes(url)) photos.push(url);
                  });
                } catch (e) {}
              }

              return (
                <View
                  key={tip.id}
                  style={{
                    backgroundColor: "#1E293B",
                    borderRadius: 20,
                    marginBottom: 16,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: "#334155",
                  }}
                >
                  {photos.length > 0 && (
                    <Image
                      source={{ uri: photos[0] }}
                      style={{ width: "100%", height: 200 }}
                      contentFit="cover"
                      transition={200}
                    />
                  )}

                  <View style={{ padding: 16 }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "900",
                        color: "#FFF",
                        marginBottom: 8,
                        lineHeight: 24,
                      }}
                    >
                      {tip.title}
                    </Text>

                    {tip.content && (
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#CBD5E1",
                          lineHeight: 20,
                        }}
                      >
                        {tip.content}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
