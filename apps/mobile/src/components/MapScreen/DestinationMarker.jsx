import { View, Text, Animated } from "react-native";
import { useEffect, useRef } from "react";
import { Marker } from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";
import { MapPin, Flame, TrendingUp } from "lucide-react-native";

export function DestinationMarker({ destination, isTrending, stats, onPress }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 6,
      useNativeDriver: true,
    }).start();

    if (isTrending) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ).start();
    }
  }, [isTrending]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Marker
      coordinate={{
        latitude: parseFloat(destination.latitude),
        longitude: parseFloat(destination.longitude),
      }}
      onPress={() => onPress(destination)}
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
            colors={
              isTrending
                ? ["#EF4444", "#DC2626", "#B91C1C"]
                : ["#EC4899", "#DB2777"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: isTrending ? 64 : 52,
              height: isTrending ? 64 : 52,
              borderRadius: isTrending ? 32 : 26,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 4,
              borderColor: "#fff",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
            }}
          >
            {isTrending ? (
              <Animated.View style={{ transform: [{ rotate }] }}>
                <Flame color="#fff" size={32} fill="#fff" strokeWidth={2} />
              </Animated.View>
            ) : (
              <MapPin color="#fff" size={28} strokeWidth={2.5} />
            )}
          </LinearGradient>

          {isTrending && (
            <Animated.View
              style={{
                position: "absolute",
                top: -6,
                left: -6,
                right: -6,
                bottom: -6,
                borderRadius: 38,
                borderWidth: 3,
                borderColor: "#EF4444",
                opacity: 0.5,
                transform: [{ scale: pulseAnim }],
              }}
            />
          )}
        </View>

        <View
          style={{
            marginTop: 8,
            alignItems: "center",
          }}
        >
          <LinearGradient
            colors={
              isTrending ? ["#EF4444", "#DC2626"] : ["#EC4899", "#DB2777"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              borderWidth: 2,
              borderColor: "#fff",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            }}
          >
            {isTrending && (
              <TrendingUp size={14} color="#fff" strokeWidth={3} />
            )}
            <Text
              style={{
                fontSize: 13,
                fontWeight: "800",
                color: "#fff",
                letterSpacing: 0.5,
              }}
            >
              {destination.name}
            </Text>
            {stats && (
              <View
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.35)",
                  borderRadius: 10,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.5)",
                }}
              >
                <Text
                  style={{ fontSize: 11, fontWeight: "800", color: "#fff" }}
                >
                  {stats.tip_count}
                </Text>
              </View>
            )}
          </LinearGradient>
        </View>
      </Animated.View>
    </Marker>
  );
}
