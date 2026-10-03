import { View, Animated } from "react-native";
import { useEffect, useRef } from "react";
import { Marker } from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";
import {
  UtensilsCrossed,
  Hotel,
  Car,
  Compass,
  MapPin,
  Flame,
} from "lucide-react-native";

const getCategoryIcon = (category) => {
  const iconProps = { color: "#fff", size: 20, strokeWidth: 2.5 };
  switch (category) {
    case "food":
      return <UtensilsCrossed {...iconProps} />;
    case "hotel":
      return <Hotel {...iconProps} />;
    case "transport":
      return <Car {...iconProps} />;
    case "excursion":
      return <Compass {...iconProps} />;
    default:
      return <MapPin {...iconProps} />;
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

export function TipMarker({ tip, onPress }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 60,
      friction: 6,
      useNativeDriver: true,
    }).start();

    if ((tip.engagement_score || 0) > 30) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, []);

  if (!tip.marker_latitude || !tip.marker_longitude) return null;

  const category = tip.marker_category || "general";
  const gradient = getCategoryGradient(category);
  const isHighEngagement = (tip.engagement_score || 0) > 30;

  return (
    <Marker
      coordinate={{
        latitude: parseFloat(tip.marker_latitude),
        longitude: parseFloat(tip.marker_longitude),
      }}
      onPress={() => onPress(tip)}
      tracksViewChanges={false}
    >
      <Animated.View
        style={{
          alignItems: "center",
          transform: [{ scale: scaleAnim }],
        }}
      >
        <View style={{ position: "relative" }}>
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: isHighEngagement ? 52 : 48,
              height: isHighEngagement ? 52 : 48,
              borderRadius: isHighEngagement ? 26 : 24,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 3,
              borderColor: "#fff",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 8,
            }}
          >
            {getCategoryIcon(category)}
          </LinearGradient>

          {isHighEngagement && (
            <Animated.View
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                transform: [{ scale: pulseAnim }],
              }}
            >
              <LinearGradient
                colors={["#EF4444", "#DC2626"]}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: "#fff",
                  shadowColor: "#EF4444",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.6,
                  shadowRadius: 4,
                }}
              >
                <Flame size={14} color="#fff" fill="#fff" />
              </LinearGradient>
            </Animated.View>
          )}

          <View
            style={{
              position: "absolute",
              top: -4,
              left: -4,
              right: -4,
              bottom: -4,
              borderRadius: isHighEngagement ? 30 : 28,
              borderWidth: 2,
              borderColor: gradient[0],
              opacity: 0.3,
            }}
          />
        </View>
      </Animated.View>
    </Marker>
  );
}
