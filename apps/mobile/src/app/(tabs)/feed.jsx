import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  MapPin,
  Star,
  BadgeCheck,
  AlertTriangle,
  ShieldAlert,
  ThumbsUp,
  Flame,
  Clock,
  MessageCircle,
  TrendingUp,
} from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import useUser from "@/utils/auth/useUser";
import { LinearGradient } from "expo-linear-gradient";

export default function FeedPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: user } = useUser();
  const [trendingTips, setTrendingTips] = useState([]);
  const [latestTips, setLatestTips] = useState([]);
  const [popularTips, setPopularTips] = useState([]);
  const [safetyReports, setSafetyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState("trending"); // trending, latest, popular

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchTrending(),
        fetchLatest(),
        fetchPopular(),
        fetchSafetyReports(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchTrending = async () => {
    try {
      const response = await fetch("/api/tips/trending?type=trending");
      if (!response.ok) throw new Error("Failed to fetch trending");
      const data = await response.json();
      setTrendingTips(data.tips || []);
    } catch (error) {
      console.error("Error fetching trending:", error);
    }
  };

  const fetchLatest = async () => {
    try {
      const response = await fetch("/api/tips/trending?type=latest");
      if (!response.ok) throw new Error("Failed to fetch latest");
      const data = await response.json();
      setLatestTips(data.tips || []);
    } catch (error) {
      console.error("Error fetching latest:", error);
    }
  };

  const fetchPopular = async () => {
    try {
      const response = await fetch("/api/tips/trending?type=popular");
      if (!response.ok) throw new Error("Failed to fetch popular");
      const data = await response.json();
      setPopularTips(data.tips || []);
    } catch (error) {
      console.error("Error fetching popular:", error);
    }
  };

  const fetchSafetyReports = async () => {
    try {
      const response = await fetch("/api/safety-reports");
      if (!response.ok) throw new Error("Failed to fetch safety reports");
      const data = await response.json();
      setSafetyReports(data.reports || []);
    } catch (error) {
      console.error("Error fetching safety reports:", error);
    }
  };

  const handleUpvote = async (tip) => {
    try {
      await fetch("/api/tips/engage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tip_id: tip.id,
          engagement_type: "upvote",
        }),
      });
      Alert.alert("Thanks! 🙌", "You just boosted this tip to the top!");
      fetchAllData(); // Refresh to show updated counts
    } catch (error) {
      console.error("Error upvoting:", error);
    }
  };

  const handleMessageAuthor = async (tipUserId, username) => {
    try {
      const response = await fetch(`/api/messages?other_user_id=${tipUserId}`);
      if (!response.ok) throw new Error("Failed to create conversation");

      router.push("/messages");
    } catch (error) {
      console.error("Error creating conversation:", error);
      Alert.alert("Oops!", "Could not start conversation");
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  const formatMinutesAgo = (minutes) => {
    if (minutes < 1) return "Just now! 🔥";
    if (minutes < 60) return `${Math.floor(minutes)}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  const getCurrentTips = () => {
    switch (activeSection) {
      case "latest":
        return latestTips;
      case "popular":
        return popularTips;
      default:
        return trendingTips;
    }
  };

  const tips = getCurrentTips();

  return (
    <View style={{ flex: 1, backgroundColor: "#F4F6F8" }}>
      <StatusBar style="dark" />

      {/* Modern Gradient Header */}
      <LinearGradient
        colors={["#008C8F", "#7DE2D1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 20,
          paddingBottom: 20,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      >
        <Text
          style={{
            fontSize: 32,
            fontWeight: "900",
            color: "#FFFFFF",
            marginBottom: 6,
          }}
        >
          What's Hot 🔥
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: "#FFFFFF",
            opacity: 0.9,
            fontWeight: "600",
          }}
        >
          Real tips from travelers just like you
        </Text>

        {/* Section Tabs */}
        <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
          <TouchableOpacity
            onPress={() => setActiveSection("trending")}
            style={{
              flex: 1,
              backgroundColor:
                activeSection === "trending"
                  ? "#FFFFFF"
                  : "rgba(255,255,255,0.25)",
              paddingVertical: 12,
              borderRadius: 14,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 6,
              shadowColor:
                activeSection === "trending" ? "#000" : "transparent",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            }}
          >
            <Flame
              size={16}
              color={activeSection === "trending" ? "#008C8F" : "#FFFFFF"}
              fill={activeSection === "trending" ? "#008C8F" : "none"}
            />
            <Text
              style={{
                color: activeSection === "trending" ? "#008C8F" : "#FFFFFF",
                fontSize: 13,
                fontWeight: "800",
              }}
            >
              On Fire
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveSection("latest")}
            style={{
              flex: 1,
              backgroundColor:
                activeSection === "latest"
                  ? "#FFFFFF"
                  : "rgba(255,255,255,0.25)",
              paddingVertical: 12,
              borderRadius: 14,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 6,
              shadowColor: activeSection === "latest" ? "#000" : "transparent",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            }}
          >
            <Clock
              size={16}
              color={activeSection === "latest" ? "#7DE2D1" : "#FFFFFF"}
            />
            <Text
              style={{
                color: activeSection === "latest" ? "#7DE2D1" : "#FFFFFF",
                fontSize: 13,
                fontWeight: "800",
              }}
            >
              Fresh
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveSection("popular")}
            style={{
              flex: 1,
              backgroundColor:
                activeSection === "popular"
                  ? "#FFFFFF"
                  : "rgba(255,255,255,0.25)",
              paddingVertical: 12,
              borderRadius: 14,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 6,
              shadowColor: activeSection === "popular" ? "#000" : "transparent",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            }}
          >
            <TrendingUp
              size={16}
              color={activeSection === "popular" ? "#F59E0B" : "#FFFFFF"}
            />
            <Text
              style={{
                color: activeSection === "popular" ? "#F59E0B" : "#FFFFFF",
                fontSize: 13,
                fontWeight: "800",
              }}
            >
              Top Picks
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#008C8F"
          />
        }
      >
        {/* Critical Safety Alerts */}
        {safetyReports
          .filter((r) => r.severity === "critical")
          .slice(0, 2)
          .map((report) => (
            <View
              key={`safety-${report.id}`}
              style={{
                margin: 16,
                marginTop: activeSection === "trending" ? 16 : 0,
                backgroundColor: "#FEE2E2",
                borderRadius: 16,
                borderWidth: 2,
                borderColor: "#DC2626",
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  backgroundColor: "#DC2626",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <ShieldAlert size={16} color="#fff" />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: "#fff",
                    letterSpacing: 0.5,
                  }}
                >
                  🚨 SAFETY ALERT - STAY SAFE OUT THERE!
                </Text>
              </View>

              <View style={{ padding: 16 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "#991B1B",
                    marginBottom: 8,
                  }}
                >
                  ⚠️ {report.title}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#7F1D1D",
                    marginBottom: 12,
                    lineHeight: 20,
                  }}
                >
                  {report.description}
                </Text>

                {report.location_name && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      marginBottom: 8,
                    }}
                  >
                    <MapPin size={14} color="#991B1B" />
                    <Text style={{ fontSize: 12, color: "#991B1B" }}>
                      {report.location_name}
                    </Text>
                  </View>
                )}

                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <Text style={{ fontSize: 11, color: "#7F1D1D" }}>
                    Reported by {report.username}
                  </Text>
                  {report.is_verified && (
                    <BadgeCheck size={12} color="#991B1B" fill="#991B1B" />
                  )}
                </View>
              </View>
            </View>
          ))}

        {/* Tips Feed */}
        {tips.map((tip) => {
          const isAvoid =
            tip.category === "avoid" || tip.category === "safety_warning";

          return (
            <View
              key={tip.id}
              style={{
                marginHorizontal: 16,
                marginBottom: 20,
                marginTop: tip === tips[0] ? 16 : 0,
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 4,
                overflow: "hidden",
                borderWidth: isAvoid ? 2 : 0,
                borderColor: isAvoid ? "#EF4444" : "transparent",
              }}
            >
              {/* Trending Badge */}
              {activeSection === "trending" && tip.engagement_score > 50 && (
                <View
                  style={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    zIndex: 10,
                  }}
                >
                  <LinearGradient
                    colors={["#EF4444", "#DC2626"]}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      shadowColor: "#EF4444",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.4,
                      shadowRadius: 6,
                    }}
                  >
                    <Flame size={14} color="#fff" fill="#fff" />
                    <Text
                      style={{ fontSize: 11, fontWeight: "800", color: "#fff" }}
                    >
                      VIRAL!
                    </Text>
                  </LinearGradient>
                </View>
              )}

              {/* Latest Badge */}
              {activeSection === "latest" && tip.minutes_ago < 60 && (
                <View
                  style={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    zIndex: 10,
                  }}
                >
                  <LinearGradient
                    colors={["#008C8F", "#7DE2D1"]}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Clock size={14} color="#fff" />
                    <Text
                      style={{ fontSize: 11, fontWeight: "800", color: "#fff" }}
                    >
                      {formatMinutesAgo(tip.minutes_ago)}
                    </Text>
                  </LinearGradient>
                </View>
              )}

              {/* Tip Image with Gradient Overlay */}
              {tip.photo_url && (
                <View style={{ position: "relative" }}>
                  <Image
                    source={{ uri: tip.photo_url }}
                    style={{ width: "100%", height: 260 }}
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.4)"]}
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 80,
                    }}
                  />
                </View>
              )}

              {/* Tip Content */}
              <View style={{ padding: 16 }}>
                {/* User Info */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  {tip.profile_image ? (
                    <Image
                      source={{ uri: tip.profile_image }}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        marginRight: 12,
                        borderWidth: 2,
                        borderColor: "#008C8F",
                      }}
                    />
                  ) : (
                    <LinearGradient
                      colors={["#008C8F", "#7DE2D1"]}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        marginRight: 12,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "bold",
                          fontSize: 18,
                        }}
                      >
                        {tip.username?.[0]?.toUpperCase()}
                      </Text>
                    </LinearGradient>
                  )}

                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
                          color: "#1E1E1E",
                        }}
                      >
                        {tip.username}
                      </Text>
                      {tip.is_verified && (
                        <BadgeCheck size={16} color="#3B82F6" fill="#3B82F6" />
                      )}
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                        marginTop: 2,
                      }}
                    >
                      <Star size={12} color="#F59E0B" fill="#F59E0B" />
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#6B7280",
                          fontWeight: "600",
                        }}
                      >
                        {tip.reputation_score || 0} traveler points
                      </Text>
                    </View>
                  </View>

                  {/* Message Button */}
                  <TouchableOpacity
                    onPress={() =>
                      handleMessageAuthor(tip.user_id, tip.username)
                    }
                    style={{
                      backgroundColor: "#F4F6F8",
                      padding: 10,
                      borderRadius: 12,
                    }}
                  >
                    <MessageCircle size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                {/* Destination */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <MapPin size={14} color="#008C8F" />
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#6B7280",
                      marginLeft: 4,
                      fontWeight: "600",
                    }}
                  >
                    {tip.destination_name}, {tip.destination_country}
                  </Text>
                </View>

                {/* Title & Content */}
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "900",
                    color: isAvoid ? "#DC2626" : "#1E1E1E",
                    marginBottom: 8,
                    lineHeight: 26,
                  }}
                >
                  {tip.title}
                </Text>
                {tip.content && (
                  <Text
                    style={{
                      fontSize: 15,
                      color: isAvoid ? "#7F1D1D" : "#4B5563",
                      lineHeight: 22,
                      marginBottom: 14,
                    }}
                  >
                    {tip.content}
                  </Text>
                )}

                {/* Engagement Stats */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 16,
                    marginBottom: 14,
                    paddingTop: 14,
                    borderTopWidth: 1,
                    borderTopColor: "#F4F6F8",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <ThumbsUp size={14} color="#008C8F" />
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#6B7280",
                        fontWeight: "700",
                      }}
                    >
                      {tip.upvotes || 0}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#6B7280",
                        fontWeight: "600",
                      }}
                    >
                      👀 {tip.views || 0}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <MessageCircle size={14} color="#6B7280" />
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#6B7280",
                        fontWeight: "600",
                      }}
                    >
                      {tip.comment_count || 0}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                {!isAvoid && (
                  <TouchableOpacity
                    onPress={() => handleUpvote(tip)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={["#008C8F", "#7DE2D1"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        borderRadius: 12,
                        paddingVertical: 14,
                        alignItems: "center",
                        flexDirection: "row",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <ThumbsUp size={16} color="#FFFFFF" strokeWidth={2.5} />
                      <Text
                        style={{
                          color: "#FFFFFF",
                          fontSize: 14,
                          fontWeight: "800",
                        }}
                      >
                        Love This!
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}

        {tips.length === 0 && (
          <View style={{ padding: 60, alignItems: "center" }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🌍</Text>
            <Text
              style={{
                fontSize: 18,
                color: "#1E1E1E",
                textAlign: "center",
                fontWeight: "700",
                marginBottom: 8,
              }}
            >
              No tips yet!
            </Text>
            <Text
              style={{ fontSize: 14, color: "#6B7280", textAlign: "center" }}
            >
              Be the first to share your travel wisdom
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
