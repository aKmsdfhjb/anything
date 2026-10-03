import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useUser from "@/utils/auth/useUser";
import {
  ArrowLeft,
  MapPin,
  ThumbsUp,
  Eye,
  MessageCircle,
  Share2,
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  Send,
  Star,
  Navigation,
} from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CATEGORY_COLORS = {
  recommend: { bg: "#10B98115", text: "#10B981", label: "Recommended" },
  avoid: { bg: "#EF444415", text: "#EF4444", label: "Avoid" },
  safety_warning: { bg: "#F59E0B15", text: "#F59E0B", label: "Safety Warning" },
};

const VENUE_ICONS = {
  hotel: "🏨",
  restaurant: "🍽️",
  bar: "🍸",
  cafe: "☕",
  museum: "🏛️",
  park: "🌳",
  beach: "🏖️",
  shopping: "🛍️",
  nightclub: "🎵",
  landmark: "🏛️",
  temple: "⛩️",
  market: "🏪",
  spa: "💆",
  transport_hub: "🚉",
  viewpoint: "👀",
  other: "📍",
};

export default function TipDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Fetch tip details
  const {
    data: tipData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tip-detail", id],
    queryFn: async () => {
      const res = await fetch(`/api/tips/${id}`);
      if (!res.ok) throw new Error("Failed to fetch tip");
      return res.json();
    },
    enabled: !!id,
  });

  // Fetch comments
  const { data: commentsData } = useQuery({
    queryKey: ["tip-comments", id],
    queryFn: async () => {
      const res = await fetch(`/api/comments?tip_id=${id}`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      return res.json();
    },
    enabled: !!id,
  });

  // Upvote mutation
  const upvoteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/tips/engage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tip_id: parseInt(id),
          engagement_type: "upvote",
        }),
      });
      if (!res.ok) throw new Error("Failed to upvote");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tip-detail", id] });
    },
  });

  // Record view
  useQuery({
    queryKey: ["tip-view", id],
    queryFn: async () => {
      await fetch("/api/tips/engage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tip_id: parseInt(id), engagement_type: "view" }),
      });
      return true;
    },
    enabled: !!id && !!user,
    staleTime: Infinity,
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async (content) => {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tip_id: parseInt(id), content }),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      return res.json();
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["tip-comments", id] });
      Alert.alert("Comment Submitted", "Your comment is pending moderation.");
    },
  });

  const handleUpvote = useCallback(() => {
    if (!user) {
      Alert.alert("Sign In", "Please sign in to upvote tips.");
      return;
    }
    upvoteMutation.mutate();
  }, [user, upvoteMutation]);

  const handleComment = useCallback(() => {
    if (!user) {
      Alert.alert("Sign In", "Please sign in to comment.");
      return;
    }
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText.trim());
  }, [user, commentText, commentMutation]);

  const tip = tipData?.tip;
  const comments = commentsData?.comments || [];

  // Parse photos
  const photos = [];
  if (tip?.photo_url) photos.push(tip.photo_url);
  if (tip?.photo_urls) {
    try {
      const parsed = JSON.parse(tip.photo_urls);
      parsed.forEach((url) => {
        if (!photos.includes(url)) photos.push(url);
      });
    } catch (e) {
      // ignore
    }
  }

  const categoryConfig = tip
    ? CATEGORY_COLORS[tip.category] || CATEGORY_COLORS.recommend
    : CATEGORY_COLORS.recommend;
  const venueIcon = tip?.venue_type
    ? VENUE_ICONS[tip.venue_type] || "📍"
    : "📍";

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F8FAFC",
        }}
      >
        <ActivityIndicator size="large" color="#008C8F" />
      </View>
    );
  }

  if (error || !tip) {
    return (
      <View
        style={{ flex: 1, backgroundColor: "#F8FAFC", paddingTop: insets.top }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <ArrowLeft size={24} color="#1E1E1E" />
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#1E1E1E" }}>
            Back
          </Text>
        </TouchableOpacity>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 16, color: "#9CA3AF" }}>Tip not found</Text>
        </View>
      </View>
    );
  }

  const timeAgo = getTimeAgo(tip.created_at);

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <StatusBar style={photos.length > 0 ? "light" : "dark"} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Photo */}
        {photos.length > 0 ? (
          <View style={{ height: 320, position: "relative" }}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(
                  e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
                );
                setActivePhotoIndex(idx);
              }}
              style={{ flexGrow: 0 }}
            >
              {photos.map((photo, idx) => (
                <Image
                  key={idx}
                  source={{ uri: photo }}
                  style={{ width: SCREEN_WIDTH, height: 320 }}
                  contentFit="cover"
                  transition={200}
                />
              ))}
            </ScrollView>

            <LinearGradient
              colors={["rgba(0,0,0,0.5)", "transparent", "rgba(0,0,0,0.3)"]}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
              pointerEvents="none"
            />

            {/* Back button */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                position: "absolute",
                top: insets.top + 10,
                left: 16,
                backgroundColor: "rgba(0,0,0,0.4)",
                padding: 10,
                borderRadius: 12,
              }}
            >
              <ArrowLeft size={22} color="#FFF" />
            </TouchableOpacity>

            {/* Photo pagination */}
            {photos.length > 1 && (
              <View
                style={{
                  position: "absolute",
                  bottom: 16,
                  left: 0,
                  right: 0,
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {photos.map((_, idx) => (
                  <View
                    key={idx}
                    style={{
                      width: idx === activePhotoIndex ? 20 : 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor:
                        idx === activePhotoIndex
                          ? "#fff"
                          : "rgba(255,255,255,0.5)",
                    }}
                  />
                ))}
              </View>
            )}

            {/* Category badge */}
            <View
              style={{ position: "absolute", top: insets.top + 10, right: 16 }}
            >
              <View
                style={{
                  backgroundColor: categoryConfig.bg,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: categoryConfig.text + "30",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "800",
                    color: categoryConfig.text,
                  }}
                >
                  {categoryConfig.label}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={{ paddingTop: insets.top }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                gap: 12,
              }}
            >
              <TouchableOpacity onPress={() => router.back()}>
                <ArrowLeft size={24} color="#1E1E1E" />
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: "#1E1E1E",
                  flex: 1,
                }}
              >
                Tip Details
              </Text>
              <View
                style={{
                  backgroundColor: categoryConfig.bg,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: categoryConfig.text,
                  }}
                >
                  {categoryConfig.label}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Content */}
        <View style={{ padding: 20 }}>
          {/* Title + Venue type */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 10,
              marginBottom: 12,
            }}
          >
            {tip.venue_type && (
              <Text style={{ fontSize: 28, marginTop: 2 }}>{venueIcon}</Text>
            )}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "900",
                  color: "#1E1E1E",
                  lineHeight: 30,
                }}
              >
                {tip.title}
              </Text>
              {tip.venue_type && (
                <Text
                  style={{
                    fontSize: 13,
                    color: "#9CA3AF",
                    fontWeight: "600",
                    marginTop: 2,
                    textTransform: "capitalize",
                  }}
                >
                  {tip.venue_type.replace("_", " ")}
                </Text>
              )}
            </View>
          </View>

          {/* Author + time */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
              backgroundColor: "#fff",
              padding: 12,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#F3F4F6",
            }}
          >
            {tip.profile_image ? (
              <Image
                source={{ uri: tip.profile_image }}
                style={{ width: 40, height: 40, borderRadius: 20 }}
                contentFit="cover"
                transition={100}
              />
            ) : (
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#008C8F15",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ fontSize: 18, fontWeight: "800", color: "#008C8F" }}
                >
                  {(tip.username || "?")[0].toUpperCase()}
                </Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Text
                  style={{ fontSize: 15, fontWeight: "800", color: "#1E1E1E" }}
                >
                  {tip.username || "Traveler"}
                </Text>
                {tip.is_verified && <CheckCircle size={14} color="#008C8F" />}
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 2,
                }}
              >
                <Clock size={12} color="#9CA3AF" />
                <Text
                  style={{ fontSize: 12, color: "#9CA3AF", fontWeight: "500" }}
                >
                  {timeAgo}
                </Text>
              </View>
            </View>
            {tip.verified_post && (
              <View
                style={{
                  backgroundColor: "#10B98115",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Shield size={12} color="#10B981" />
                <Text
                  style={{ fontSize: 10, fontWeight: "700", color: "#10B981" }}
                >
                  Verified
                </Text>
              </View>
            )}
          </View>

          {/* Warning severity */}
          {tip.warning_severity && tip.category !== "recommend" && (
            <View
              style={{
                backgroundColor:
                  tip.warning_severity === "critical" ? "#FEE2E2" : "#FEF3C7",
                padding: 14,
                borderRadius: 14,
                marginBottom: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <AlertTriangle
                size={20}
                color={
                  tip.warning_severity === "critical" ? "#EF4444" : "#F59E0B"
                }
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "800",
                    color:
                      tip.warning_severity === "critical"
                        ? "#EF4444"
                        : "#92400E",
                    textTransform: "uppercase",
                  }}
                >
                  {tip.warning_severity} Warning
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color:
                      tip.warning_severity === "critical"
                        ? "#991B1B"
                        : "#78350F",
                    marginTop: 2,
                  }}
                >
                  Please exercise caution in this area
                </Text>
              </View>
            </View>
          )}

          {/* Location */}
          {(tip.location_name || tip.destination_name) && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
                backgroundColor: "#fff",
                padding: 12,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "#F3F4F6",
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: "#008C8F10",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MapPin size={18} color="#008C8F" />
              </View>
              <View style={{ flex: 1 }}>
                {tip.location_name && (
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: "#1E1E1E",
                    }}
                    numberOfLines={2}
                  >
                    {tip.location_name}
                  </Text>
                )}
                <Text
                  style={{
                    fontSize: 12,
                    color: "#9CA3AF",
                    marginTop: tip.location_name ? 2 : 0,
                  }}
                >
                  {tip.destination_name}, {tip.destination_country}
                </Text>
              </View>
              {(tip.location_latitude || tip.dest_latitude) && (
                <Navigation size={16} color="#D1D5DB" />
              )}
            </View>
          )}

          {/* Content text */}
          {tip.content && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, color: "#374151", lineHeight: 26 }}>
                {tip.content}
              </Text>
            </View>
          )}

          {/* Best time + special tips */}
          {(tip.best_time_to_visit || tip.special_tips) && (
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 16,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: "#F3F4F6",
              }}
            >
              {tip.best_time_to_visit && (
                <View style={{ marginBottom: tip.special_tips ? 14 : 0 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 6,
                    }}
                  >
                    <Calendar size={14} color="#008C8F" />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "800",
                        color: "#008C8F",
                      }}
                    >
                      Best Time to Visit
                    </Text>
                  </View>
                  <Text
                    style={{ fontSize: 14, color: "#374151", lineHeight: 22 }}
                  >
                    {tip.best_time_to_visit}
                  </Text>
                </View>
              )}
              {tip.special_tips && (
                <View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 6,
                    }}
                  >
                    <Sparkles size={14} color="#F59E0B" />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "800",
                        color: "#F59E0B",
                      }}
                    >
                      Insider Tips
                    </Text>
                  </View>
                  <Text
                    style={{ fontSize: 14, color: "#374151", lineHeight: 22 }}
                  >
                    {tip.special_tips}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Engagement stats */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              backgroundColor: "#fff",
              padding: 16,
              borderRadius: 16,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: "#F3F4F6",
            }}
          >
            <TouchableOpacity
              onPress={handleUpvote}
              style={{ alignItems: "center", gap: 6 }}
              disabled={upvoteMutation.isPending}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: "#008C8F10",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ThumbsUp size={20} color="#008C8F" />
              </View>
              <Text
                style={{ fontSize: 16, fontWeight: "900", color: "#1E1E1E" }}
              >
                {tip.upvotes || 0}
              </Text>
              <Text
                style={{ fontSize: 11, color: "#9CA3AF", fontWeight: "600" }}
              >
                Upvotes
              </Text>
            </TouchableOpacity>

            <View style={{ alignItems: "center", gap: 6 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: "#3B82F610",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Eye size={20} color="#3B82F6" />
              </View>
              <Text
                style={{ fontSize: 16, fontWeight: "900", color: "#1E1E1E" }}
              >
                {tip.views || 0}
              </Text>
              <Text
                style={{ fontSize: 11, color: "#9CA3AF", fontWeight: "600" }}
              >
                Views
              </Text>
            </View>

            <View style={{ alignItems: "center", gap: 6 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: "#F59E0B10",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MessageCircle size={20} color="#F59E0B" />
              </View>
              <Text
                style={{ fontSize: 16, fontWeight: "900", color: "#1E1E1E" }}
              >
                {tip.comment_count || 0}
              </Text>
              <Text
                style={{ fontSize: 11, color: "#9CA3AF", fontWeight: "600" }}
              >
                Comments
              </Text>
            </View>
          </View>

          {/* Comments Section */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "900",
                color: "#1E1E1E",
                marginBottom: 14,
              }}
            >
              💬 Comments
            </Text>

            {comments.length === 0 ? (
              <View
                style={{
                  backgroundColor: "#fff",
                  padding: 24,
                  borderRadius: 16,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#F3F4F6",
                }}
              >
                <MessageCircle size={32} color="#D1D5DB" />
                <Text
                  style={{
                    fontSize: 14,
                    color: "#9CA3AF",
                    fontWeight: "600",
                    marginTop: 10,
                  }}
                >
                  No comments yet. Be the first!
                </Text>
              </View>
            ) : (
              comments.map((comment) => (
                <View
                  key={comment.id}
                  style={{
                    backgroundColor: "#fff",
                    padding: 14,
                    borderRadius: 14,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: "#F3F4F6",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    {comment.profile_image ? (
                      <Image
                        source={{ uri: comment.profile_image }}
                        style={{ width: 28, height: 28, borderRadius: 14 }}
                        contentFit="cover"
                        transition={100}
                      />
                    ) : (
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          backgroundColor: "#008C8F15",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "800",
                            color: "#008C8F",
                          }}
                        >
                          {(comment.username || "?")[0].toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
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
                            fontWeight: "700",
                            color: "#1E1E1E",
                          }}
                        >
                          {comment.username}
                        </Text>
                        {comment.is_verified && (
                          <CheckCircle size={12} color="#008C8F" />
                        )}
                      </View>
                    </View>
                    <Text style={{ fontSize: 11, color: "#D1D5DB" }}>
                      {getTimeAgo(comment.created_at)}
                    </Text>
                  </View>
                  <Text
                    style={{ fontSize: 14, color: "#374151", lineHeight: 20 }}
                  >
                    {comment.content}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Fixed comment input */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: insets.bottom + 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <TextInput
          value={commentText}
          onChangeText={setCommentText}
          placeholder="Add a comment..."
          placeholderTextColor="#9CA3AF"
          style={{
            flex: 1,
            backgroundColor: "#F9FAFB",
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: Platform.OS === "ios" ? 12 : 8,
            fontSize: 14,
            color: "#1E1E1E",
            borderWidth: 1,
            borderColor: "#E5E7EB",
          }}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          onPress={handleComment}
          disabled={!commentText.trim() || commentMutation.isPending}
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: commentText.trim() ? "#008C8F" : "#E5E7EB",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {commentMutation.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Send size={18} color={commentText.trim() ? "#fff" : "#9CA3AF"} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function getTimeAgo(dateString) {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString();
}
