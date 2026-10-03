"use client";

import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import {
  MapPin,
  Star,
  BadgeCheck,
  ShieldAlert,
  ThumbsUp,
  Flame,
  Clock,
  MessageCircle,
  TrendingUp,
} from "lucide-react";

export default function FeedPage() {
  const { data: user } = useUser();
  const [trendingTips, setTrendingTips] = useState([]);
  const [latestTips, setLatestTips] = useState([]);
  const [popularTips, setPopularTips] = useState([]);
  const [safetyReports, setSafetyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState("trending");

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
      alert("Thanks! 🙌 You just boosted this tip to the top!");
      fetchAllData();
    } catch (error) {
      console.error("Error upvoting:", error);
    }
  };

  const formatMinutesAgo = (minutes) => {
    if (minutes < 1) return "Just now! 🔥";
    if (minutes < 60) return `${Math.floor(minutes)}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008C8F]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] px-5 md:px-8 py-8 rounded-b-[2rem]">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
            What's Hot 🔥
          </h1>
          <p className="text-base text-white opacity-90 font-semibold">
            Real tips from travelers just like you
          </p>

          {/* Section Tabs */}
          <div className="grid grid-cols-3 gap-2 mt-6">
            <button
              onClick={() => setActiveSection("trending")}
              className={`py-3 rounded-2xl flex items-center justify-center gap-2 transition-all ${
                activeSection === "trending"
                  ? "bg-white text-[#008C8F] shadow-lg"
                  : "bg-white bg-opacity-25 text-white"
              }`}
            >
              <Flame
                className={`w-4 h-4 ${activeSection === "trending" ? "fill-[#008C8F]" : ""}`}
              />
              <span className="text-sm font-extrabold">On Fire</span>
            </button>

            <button
              onClick={() => setActiveSection("latest")}
              className={`py-3 rounded-2xl flex items-center justify-center gap-2 transition-all ${
                activeSection === "latest"
                  ? "bg-white text-[#008C8F] shadow-lg"
                  : "bg-white bg-opacity-25 text-white"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="text-sm font-extrabold">Fresh</span>
            </button>

            <button
              onClick={() => setActiveSection("popular")}
              className={`py-3 rounded-2xl flex items-center justify-center gap-2 transition-all ${
                activeSection === "popular"
                  ? "bg-white text-[#F59E0B] shadow-lg"
                  : "bg-white bg-opacity-25 text-white"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-extrabold">Top Picks</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 md:px-8">
        {/* Critical Safety Alerts */}
        {safetyReports
          .filter((r) => r.severity === "critical")
          .slice(0, 2)
          .map((report) => (
            <div
              key={`safety-${report.id}`}
              className="mt-6 bg-red-50 border-2 border-red-600 rounded-2xl overflow-hidden"
            >
              <div className="bg-red-600 px-4 py-2 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-white" />
                <span className="text-xs font-bold text-white tracking-wide">
                  🚨 SAFETY ALERT - STAY SAFE OUT THERE!
                </span>
              </div>

              <div className="p-5">
                <h3 className="text-xl font-bold text-red-900 mb-3">
                  ⚠️ {report.title}
                </h3>
                <p className="text-sm text-red-800 mb-4 leading-relaxed">
                  {report.description}
                </p>

                {report.location_name && (
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-red-900" />
                    <span className="text-sm text-red-900">
                      {report.location_name}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-800">
                    Reported by {report.username}
                  </span>
                  {report.is_verified && (
                    <BadgeCheck className="w-3 h-3 text-red-900 fill-red-900" />
                  )}
                </div>
              </div>
            </div>
          ))}

        {/* Tips Feed */}
        <div className="space-y-6 mt-6">
          {tips.map((tip) => {
            const isAvoid =
              tip.category === "avoid" || tip.category === "safety_warning";

            return (
              <div
                key={tip.id}
                className={`bg-white rounded-3xl shadow-lg overflow-hidden ${
                  isAvoid ? "border-2 border-red-500" : ""
                }`}
              >
                {/* Badges */}
                {activeSection === "trending" && tip.engagement_score > 50 && (
                  <div className="absolute top-4 left-4 z-10">
                    <div className="bg-gradient-to-r from-red-500 to-red-600 px-3 py-2 rounded-xl flex items-center gap-1 shadow-lg">
                      <Flame className="w-4 h-4 text-white fill-white" />
                      <span className="text-xs font-extrabold text-white">
                        VIRAL!
                      </span>
                    </div>
                  </div>
                )}

                {activeSection === "latest" && tip.minutes_ago < 60 && (
                  <div className="absolute top-4 left-4 z-10">
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-3 py-2 rounded-xl flex items-center gap-1">
                      <Clock className="w-4 h-4 text-white" />
                      <span className="text-xs font-extrabold text-white">
                        {formatMinutesAgo(tip.minutes_ago)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Tip Image */}
                {tip.photo_url && (
                  <div className="relative">
                    <img
                      src={tip.photo_url}
                      alt={tip.title}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                )}

                {/* Tip Content */}
                <div className="p-6">
                  {/* User Info */}
                  <div className="flex items-center mb-4">
                    {tip.profile_image ? (
                      <img
                        src={tip.profile_image}
                        alt={tip.username}
                        className="w-11 h-11 rounded-full border-2 border-[#008C8F] mr-3"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-lg">
                          {tip.username?.[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-gray-900">
                          {tip.username}
                        </span>
                        {tip.is_verified && (
                          <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs text-gray-600 font-semibold">
                          {tip.reputation_score || 0} traveler points
                        </span>
                      </div>
                    </div>

                    <button className="bg-gray-100 p-2 rounded-xl hover:bg-gray-200">
                      <MessageCircle className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Destination */}
                  <div className="flex items-center mb-3">
                    <MapPin className="w-4 h-4 text-[#008C8F]" />
                    <span className="text-sm text-gray-600 ml-1 font-semibold">
                      {tip.destination_name}, {tip.destination_country}
                    </span>
                  </div>

                  {/* Title & Content */}
                  <h2
                    className={`text-2xl font-black mb-3 leading-tight ${
                      isAvoid ? "text-red-600" : "text-gray-900"
                    }`}
                  >
                    {tip.title}
                  </h2>
                  {tip.content && (
                    <p
                      className={`text-base leading-relaxed mb-4 ${
                        isAvoid ? "text-red-900" : "text-gray-700"
                      }`}
                    >
                      {tip.content}
                    </p>
                  )}

                  {/* Engagement Stats */}
                  <div className="flex items-center gap-5 mb-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4 text-[#008C8F]" />
                      <span className="text-sm text-gray-600 font-bold">
                        {tip.upvotes || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600 font-semibold">
                        👀 {tip.views || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600 font-semibold">
                        {tip.comment_count || 0}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  {!isAvoid && (
                    <button
                      onClick={() => handleUpvote(tip)}
                      className="w-full bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] text-white py-3 rounded-xl font-extrabold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Love This!
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {tips.length === 0 && (
            <div className="py-20 text-center">
              <div className="text-5xl mb-5">🌍</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No tips yet!
              </h2>
              <p className="text-gray-600">
                Be the first to share your travel wisdom
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
