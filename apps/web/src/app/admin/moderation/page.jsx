"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useUser from "@/utils/useUser";
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  User,
  Eye,
  Image as ImageIcon,
  ChevronDown,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  Star,
  MessageSquare,
} from "lucide-react";

const VENUE_TYPE_LABELS = {
  hotel: "🏨 Hotel",
  restaurant: "🍽️ Restaurant",
  bar: "🍸 Bar",
  cafe: "☕ Café",
  museum: "🏛️ Museum",
  park: "🌳 Park",
  beach: "🏖️ Beach",
  shopping: "🛍️ Shopping",
  nightclub: "🎶 Nightclub",
  landmark: "🗿 Landmark",
  temple: "⛩️ Temple",
  market: "🏪 Market",
  spa: "💆 Spa",
  transport_hub: "🚉 Transport Hub",
  viewpoint: "🌄 Viewpoint",
  other: "📍 Other",
};

export default function ModerationPage() {
  const { data: user, loading: userLoading } = useUser();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("pending");
  const [expandedTip, setExpandedTip] = useState(null);
  const [moderationNote, setModerationNote] = useState("");

  // Fetch tips for moderation
  const { data, isLoading, error } = useQuery({
    queryKey: ["moderation-tips", activeTab],
    queryFn: async () => {
      const res = await fetch(`/api/moderation/tips?status=${activeTab}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to load");
      }
      return res.json();
    },
    enabled: !!user,
  });

  const tips = data?.tips || [];
  const counts = data?.counts || {
    pending_count: 0,
    approved_count: 0,
    rejected_count: 0,
  };

  // Moderate mutation
  const moderateMutation = useMutation({
    mutationFn: async ({ tip_id, action, note }) => {
      const res = await fetch("/api/moderation/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tip_id, action, note }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to moderate");
      return resData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderation-tips"] });
      setExpandedTip(null);
      setModerationNote("");
    },
  });

  const handleModerate = (tipId, action) => {
    moderateMutation.mutate({
      tip_id: tipId,
      action,
      note: moderationNote || null,
    });
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#008C8F]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center px-5">
        <div className="text-center">
          <Shield className="w-16 h-16 text-[#008C8F] mx-auto mb-4" />
          <h1 className="text-2xl font-black text-[#1E1E1E] mb-3">
            Admin Access Required
          </h1>
          <p className="text-gray-500 mb-6">
            Please sign in with an admin account to access moderation.
          </p>
          <a
            href="/account/signin?callbackUrl=/admin/moderation"
            className="inline-block bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] text-white font-bold py-3 px-8 rounded-2xl"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] px-5 md:px-8 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="bg-white bg-opacity-20 p-2 rounded-xl hover:bg-opacity-30 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </a>
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-white" />
                <h1 className="text-2xl font-black text-white">
                  Tip Moderation
                </h1>
              </div>
              <p className="text-white text-opacity-80 text-sm mt-1">
                Review and approve user-submitted tips
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 md:px-8 mt-6">
        {/* Error */}
        {error && (
          <div className="bg-red-500 bg-opacity-15 border border-red-500 border-opacity-30 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-red-300 text-sm font-semibold">
              {error.message}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-3 mb-6 overflow-x-auto">
          {[
            {
              key: "pending",
              label: "Pending",
              count: counts.pending_count,
              color: "#F59E0B",
              icon: Clock,
            },
            {
              key: "approved",
              label: "Approved",
              count: counts.approved_count,
              color: "#10B981",
              icon: CheckCircle,
            },
            {
              key: "rejected",
              label: "Rejected",
              count: counts.rejected_count,
              color: "#EF4444",
              icon: XCircle,
            },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all border-2 shrink-0"
                style={{
                  borderColor: isActive ? tab.color : "#E5E7EB",
                  backgroundColor: isActive ? tab.color + "15" : "#FFFFFF",
                  color: isActive ? tab.color : "#6B7280",
                }}
              >
                <TabIcon className="w-4 h-4" />
                {tab.label}
                <span
                  className="px-2 py-0.5 rounded-lg text-xs font-black"
                  style={{
                    backgroundColor: isActive ? tab.color + "20" : "#F3F4F6",
                    color: isActive ? tab.color : "#9CA3AF",
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#008C8F]" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && tips.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <div className="text-5xl mb-4">
              {activeTab === "pending"
                ? "✅"
                : activeTab === "approved"
                  ? "📭"
                  : "📭"}
            </div>
            <h3 className="text-xl font-bold text-[#1E1E1E] mb-2">
              {activeTab === "pending"
                ? "All caught up!"
                : `No ${activeTab} tips yet`}
            </h3>
            <p className="text-sm text-gray-500">
              {activeTab === "pending"
                ? "There are no tips waiting for review right now."
                : `Tips that have been ${activeTab} will appear here.`}
            </p>
          </div>
        )}

        {/* Tips list */}
        <div className="space-y-4">
          {tips.map((tip) => {
            const isExpanded = expandedTip === tip.id;
            let photoList = [];
            if (tip.photo_url) photoList.push(tip.photo_url);
            if (tip.photo_urls) {
              try {
                const parsed =
                  typeof tip.photo_urls === "string"
                    ? JSON.parse(tip.photo_urls)
                    : tip.photo_urls;
                if (Array.isArray(parsed)) {
                  parsed.forEach((url) => {
                    if (!photoList.includes(url)) photoList.push(url);
                  });
                }
              } catch (e) {}
            }

            return (
              <div
                key={tip.id}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
              >
                {/* Tip header */}
                <button
                  onClick={() => setExpandedTip(isExpanded ? null : tip.id)}
                  className="w-full p-5 text-left flex items-start gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className="px-2 py-0.5 rounded-lg text-xs font-bold"
                        style={{
                          backgroundColor:
                            tip.category === "recommend"
                              ? "#10B98115"
                              : tip.category === "avoid"
                                ? "#EF444415"
                                : "#F59E0B15",
                          color:
                            tip.category === "recommend"
                              ? "#10B981"
                              : tip.category === "avoid"
                                ? "#EF4444"
                                : "#F59E0B",
                        }}
                      >
                        {tip.category === "recommend"
                          ? "👍 Recommend"
                          : tip.category === "avoid"
                            ? "👎 Avoid"
                            : "⚠️ Warning"}
                      </span>
                      {tip.venue_type && (
                        <span className="text-xs text-gray-500 font-semibold">
                          {VENUE_TYPE_LABELS[tip.venue_type] || tip.venue_type}
                        </span>
                      )}
                      {photoList.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <ImageIcon className="w-3 h-3" />
                          {photoList.length}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-[#1E1E1E] mb-1 truncate">
                      {tip.title}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {tip.destination_name}, {tip.destination_country}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {tip.username}
                        {tip.user_verified && (
                          <CheckCircle className="w-3 h-3 text-[#008C8F]" />
                        )}
                      </span>
                      <span>
                        {new Date(tip.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-100">
                    {/* Photos */}
                    {photoList.length > 0 && (
                      <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                        {photoList.map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt={`Photo ${i + 1}`}
                            className="w-32 h-32 object-cover rounded-xl shrink-0"
                          />
                        ))}
                      </div>
                    )}

                    {/* Content */}
                    <div className="mt-4 space-y-4">
                      {tip.content && (
                        <div>
                          <p className="text-xs text-[#008C8F] font-bold mb-1 uppercase">
                            What's Good to Know
                          </p>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {tip.content}
                          </p>
                        </div>
                      )}

                      {tip.best_time_to_visit && (
                        <div>
                          <p className="text-xs text-[#06B6D4] font-bold mb-1 uppercase">
                            Best Time to Visit
                          </p>
                          <p className="text-sm text-gray-600">
                            {tip.best_time_to_visit}
                          </p>
                        </div>
                      )}

                      {tip.special_tips && (
                        <div>
                          <p className="text-xs text-[#F59E0B] font-bold mb-1 uppercase">
                            Insider Tips
                          </p>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {tip.special_tips}
                          </p>
                        </div>
                      )}

                      {tip.location_name && (
                        <div>
                          <p className="text-xs text-[#10B981] font-bold mb-1 uppercase">
                            Address/Area
                          </p>
                          <p className="text-sm text-gray-600">
                            {tip.location_name}
                          </p>
                        </div>
                      )}

                      {tip.warning_severity && (
                        <div>
                          <p className="text-xs text-[#EF4444] font-bold mb-1 uppercase">
                            Warning Severity
                          </p>
                          <p className="text-sm text-gray-600 capitalize">
                            {tip.warning_severity}
                          </p>
                        </div>
                      )}

                      {/* User info */}
                      <div className="bg-[#F4F6F8] rounded-xl p-4 flex items-center gap-3">
                        {tip.profile_image ? (
                          <img
                            src={tip.profile_image}
                            alt={tip.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-[#1E1E1E] font-bold text-sm flex items-center gap-1">
                            {tip.username}
                            {tip.user_verified && (
                              <CheckCircle className="w-3.5 h-3.5 text-[#008C8F]" />
                            )}
                          </p>
                          <p className="text-xs text-gray-400">
                            Rep: {tip.reputation_score || 0} •{" "}
                            {tip.verified_post
                              ? "Verified post"
                              : "Unverified post"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Moderation actions */}
                    {activeTab === "pending" && (
                      <div className="mt-5 pt-4 border-t border-gray-100">
                        <textarea
                          value={moderationNote}
                          onChange={(e) => setModerationNote(e.target.value)}
                          placeholder="Add a moderation note (optional)..."
                          rows={2}
                          className="w-full bg-[#F4F6F8] border border-gray-200 rounded-xl px-4 py-3 text-[#1E1E1E] text-sm font-semibold outline-none focus:border-[#008C8F] transition-all placeholder-gray-400 resize-none mb-3"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleModerate(tip.id, "approve")}
                            disabled={moderateMutation.isPending}
                            className="flex-1 bg-[#10B981] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#059669] transition-all disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleModerate(tip.id, "reject")}
                            disabled={moderateMutation.isPending}
                            className="flex-1 bg-[#EF4444] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#DC2626] transition-all disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Show moderation info for approved/rejected */}
                    {activeTab !== "pending" && tip.moderated_at && (
                      <div className="mt-4 bg-[#F4F6F8] rounded-xl p-4">
                        <p className="text-xs text-gray-400 mb-1">
                          {activeTab === "approved" ? "Approved" : "Rejected"}{" "}
                          on{" "}
                          {new Date(tip.moderated_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                        {tip.moderation_note && (
                          <p className="text-sm text-gray-500 mt-1">
                            Note: {tip.moderation_note}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
