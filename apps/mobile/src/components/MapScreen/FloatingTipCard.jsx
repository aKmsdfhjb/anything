import { View, Text, TouchableOpacity, Animated } from "react-native";
import { useEffect, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import {
  X,
  Star,
  MessageCircle,
  BadgeCheck,
  Flame,
  UtensilsCrossed,
  Hotel,
  Car,
  Compass,
  MapPin,
} from "lucide-react-native";

const getCategoryIcon = (category) => {
  switch (category) {
    case "food":
      return <UtensilsCrossed color="#fff" size={18} />;
    case "hotel":
      return <Hotel color="#fff" size={18} />;
    case "transport":
      return <Car color="#fff" size={18} />;
    case "excursion":
      return <Compass color="#fff" size={18} />;
    default:
      return <MapPin color="#fff" size={18} />;
  }
};

const getCategoryGradient = (category) => {
  switch (category) {
    case "food":
      return ["#F59E0B", "#F97316"];
    case "hotel":
      return ["#8B5CF6", "#A855F7"];
    case "transport":
      return ["#10B981", "#14B8A6"];
    case "excursion":
      return ["#3B82F6", "#2563EB"];
    default:
      return ["#EC4899", "#EF4444"];
  }
};

export function FloatingTipCard({ tip, insets, onClose }) {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  const gradient = getCategoryGradient(tip.marker_category);

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: insets.bottom + 20,
        left: 16,
        right: 16,
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
      }}
    >
      <BlurView
        intensity={95}
        tint="light"
        style={{
          borderRadius: 24,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.6)",
        }}
      >
        <View
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.92)",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.35,
            shadowRadius: 24,
          }}
        >
          <TouchableOpacity
            onPress={handleClose}
            activeOpacity={0.8}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 10,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 2,
              borderColor: "rgba(255, 255, 255, 0.3)",
            }}
          >
            <X size={20} color="#fff" strokeWidth={3} />
          </TouchableOpacity>

          {tip.photo_url && (
            <View style={{ position: "relative" }}>
              <Image
                source={{ uri: tip.photo_url }}
                style={{
                  width: "100%",
                  height: 180,
                }}
                contentFit="cover"
              />
              <LinearGradient
                colors={["transparent", "rgba(0, 0, 0, 0.3)"]}
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

          <View style={{ padding: 20 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <LinearGradient
                colors={gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  shadowColor: gradient[0],
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                }}
              >
                {getCategoryIcon(tip.marker_category)}
                <Text
                  style={{
                    fontSize: 13,
                    color: "#fff",
                    textTransform: "uppercase",
                    fontWeight: "800",
                    letterSpacing: 1,
                  }}
                >
                  {tip.marker_category}
                </Text>
              </LinearGradient>

              {tip.engagement_score > 30 && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    backgroundColor: "#FEF3C7",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 10,
                    borderWidth: 1.5,
                    borderColor: "#F59E0B",
                  }}
                >
                  <Flame size={14} color="#F59E0B" fill="#F59E0B" />
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#92400E",
                      fontWeight: "700",
                    }}
                  >
                    Trending
                  </Text>
                </View>
              )}
            </View>

            <Text
              style={{
                fontSize: 22,
                fontWeight: "800",
                color: "#0F172A",
                marginBottom: 10,
                lineHeight: 28,
                letterSpacing: 0.3,
              }}
            >
              {tip.title}
            </Text>

            {tip.content && (
              <Text
                style={{
                  fontSize: 15,
                  color: "#475569",
                  lineHeight: 22,
                  marginBottom: 16,
                }}
                numberOfLines={3}
              >
                {tip.content}
              </Text>
            )}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: "#E2E8F0",
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <LinearGradient
                  colors={["#6366F1", "#8B5CF6"]}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 2,
                    borderColor: "#fff",
                  }}
                >
                  <Text
                    style={{ fontSize: 18, fontWeight: "800", color: "#fff" }}
                  >
                    {tip.username?.[0]?.toUpperCase()}
                  </Text>
                </LinearGradient>
                <View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "700",
                        color: "#0F172A",
                      }}
                    >
                      {tip.username}
                    </Text>
                    {tip.is_verified && (
                      <BadgeCheck size={16} color="#3B82F6" fill="#3B82F6" />
                    )}
                  </View>
                  <Text
                    style={{ fontSize: 12, color: "#64748B", marginTop: 1 }}
                  >
                    {tip.destination_name}
                  </Text>
                </View>
              </View>

              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                    backgroundColor: "#FEF3C7",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 10,
                  }}
                >
                  <Star size={16} color="#F59E0B" fill="#F59E0B" />
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#92400E",
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
                    gap: 5,
                    backgroundColor: "#E0E7FF",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 10,
                  }}
                >
                  <MessageCircle size={16} color="#6366F1" />
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#4338CA",
                      fontWeight: "700",
                    }}
                  >
                    {tip.comment_count || 0}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );
}
