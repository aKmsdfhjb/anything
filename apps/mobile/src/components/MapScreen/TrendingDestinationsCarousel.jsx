import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { Image } from "expo-image";
import { Flame, MapPin, TrendingUp } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width: screenWidth } = Dimensions.get("window");

export function TrendingDestinationsCarousel({
  destinations,
  onDestinationPress,
}) {
  if (!destinations || destinations.length === 0) return null;

  const renderDestinationCard = ({ item: destination }) => {
    return (
      <TouchableOpacity
        onPress={() => onDestinationPress?.(destination)}
        activeOpacity={0.9}
        style={{
          width: screenWidth * 0.7,
          marginHorizontal: 6,
        }}
      >
        <View
          style={{
            borderRadius: 20,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          {/* Image Background */}
          {destination.image_url ? (
            <Image
              source={{ uri: destination.image_url }}
              style={{ width: "100%", height: 180 }}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <LinearGradient
              colors={["#FF006E", "#8B5CF6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: "100%", height: 180 }}
            />
          )}

          {/* Gradient Overlay */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.85)"]}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 120,
            }}
          />

          {/* Trending Badge */}
          <View
            style={{
              position: "absolute",
              top: 12,
              left: 12,
            }}
          >
            <LinearGradient
              colors={["#EF4444", "#DC2626"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                borderWidth: 2,
                borderColor: "rgba(255,255,255,0.3)",
              }}
            >
              <Flame size={14} color="#FFF" fill="#FFF" />
              <Text style={{ fontSize: 11, fontWeight: "800", color: "#FFF" }}>
                TRENDING
              </Text>
            </LinearGradient>
          </View>

          {/* Content */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: 16,
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: "900",
                color: "#FFF",
                marginBottom: 4,
                textShadowColor: "rgba(0,0,0,0.5)",
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
              }}
              numberOfLines={1}
            >
              {destination.name}
            </Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <MapPin size={14} color="#FCD34D" />
              <Text
                style={{
                  fontSize: 13,
                  color: "#FFF",
                  fontWeight: "600",
                  opacity: 0.9,
                }}
              >
                {destination.country}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <LinearGradient
            colors={["#EF4444", "#DC2626"]}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TrendingUp size={18} color="#FFF" strokeWidth={2.5} />
          </LinearGradient>
          <Text style={{ fontSize: 20, fontWeight: "900", color: "#0F172A" }}>
            🔥 Trending Now
          </Text>
        </View>
      </View>

      <Carousel
        loop={false}
        width={screenWidth * 0.7 + 12}
        height={180}
        data={destinations}
        scrollAnimationDuration={300}
        renderItem={renderDestinationCard}
      />
    </View>
  );
}
