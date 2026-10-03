import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { Image } from "expo-image";
import { MapPin, ThumbsUp, Eye, BadgeCheck } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width: screenWidth } = Dimensions.get("window");

export function NearbyTipsCarousel({ tips, onTipPress }) {
  if (!tips || tips.length === 0) return null;

  const renderTipCard = ({ item: tip }) => {
    const isWarning =
      tip.category === "avoid" || tip.category === "safety_warning";

    return (
      <TouchableOpacity
        onPress={() => onTipPress?.(tip)}
        activeOpacity={0.9}
        style={{
          width: screenWidth * 0.85,
          marginHorizontal: 8,
        }}
      >
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 24,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          {/* Image with Gradient Overlay */}
          {tip.photo_url ? (
            <View style={{ position: "relative" }}>
              <Image
                source={{ uri: tip.photo_url }}
                style={{ width: "100%", height: 200 }}
                contentFit="cover"
                transition={300}
              />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.7)"]}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 100,
                }}
              />

              {/* Category Badge */}
              <View
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                }}
              >
                <LinearGradient
                  colors={
                    isWarning ? ["#EF4444", "#DC2626"] : ["#8B5CF6", "#7C3AED"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Text
                    style={{ fontSize: 11, fontWeight: "800", color: "#FFF" }}
                  >
                    {isWarning ? "⚠️ AVOID" : "✨ TIP"}
                  </Text>
                </LinearGradient>
              </View>

              {/* User Badge */}
              <View
                style={{
                  position: "absolute",
                  bottom: 12,
                  left: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: "#FF006E",
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 2,
                    borderColor: "#FFF",
                  }}
                >
                  <Text
                    style={{ color: "#FFF", fontWeight: "bold", fontSize: 14 }}
                  >
                    {tip.username?.[0]?.toUpperCase()}
                  </Text>
                </View>
                <View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Text
                      style={{ fontSize: 13, fontWeight: "700", color: "#FFF" }}
                    >
                      {tip.username}
                    </Text>
                    {tip.is_verified && (
                      <BadgeCheck size={14} color="#3B82F6" fill="#3B82F6" />
                    )}
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <LinearGradient
              colors={
                isWarning ? ["#FEE2E2", "#FCA5A5"] : ["#EDE9FE", "#DDD6FE"]
              }
              style={{ width: "100%", height: 120 }}
            />
          )}

          {/* Content */}
          <View style={{ padding: 16 }}>
            {/* Location */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginBottom: 8,
              }}
            >
              <MapPin size={14} color="#FF006E" />
              <Text
                style={{ fontSize: 12, color: "#64748B", fontWeight: "600" }}
              >
                {tip.destination_name}
              </Text>
            </View>

            {/* Title */}
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: isWarning ? "#DC2626" : "#0F172A",
                marginBottom: 6,
                lineHeight: 24,
              }}
              numberOfLines={2}
            >
              {tip.title}
            </Text>

            {/* Content Preview */}
            {tip.content && (
              <Text
                style={{
                  fontSize: 14,
                  color: "#475569",
                  lineHeight: 20,
                  marginBottom: 12,
                }}
                numberOfLines={2}
              >
                {tip.content}
              </Text>
            )}

            {/* Stats */}
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <ThumbsUp size={14} color="#FF006E" />
                <Text
                  style={{ fontSize: 12, color: "#64748B", fontWeight: "600" }}
                >
                  {tip.upvotes || 0}
                </Text>
              </View>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Eye size={14} color="#64748B" />
                <Text
                  style={{ fontSize: 12, color: "#64748B", fontWeight: "600" }}
                >
                  {tip.views || 0}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ marginVertical: 12 }}>
      <Carousel
        loop={false}
        width={screenWidth * 0.85 + 16}
        height={(tip) => (tip.photo_url ? 360 : 280)}
        data={tips}
        scrollAnimationDuration={300}
        renderItem={renderTipCard}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
      />
    </View>
  );
}
