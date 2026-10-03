import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import {
  Sparkles,
  UtensilsCrossed,
  Hotel,
  Car,
  Compass,
} from "lucide-react-native";

export function FilterBar({
  activeFilter,
  onFilterChange,
  filterAnimation,
  mapPointsData,
}) {
  const filterTranslateY = filterAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 0],
  });

  const filterOpacity = filterAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const filterScale = filterAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 140,
        left: 16,
        right: 16,
        zIndex: 9,
        transform: [{ translateY: filterTranslateY }, { scale: filterScale }],
        opacity: filterOpacity,
      }}
    >
      <BlurView
        intensity={90}
        tint="light"
        style={{
          borderRadius: 20,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.5)",
        }}
      >
        <View
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            padding: 14,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
          }}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <FilterButton
                active={activeFilter === "all"}
                onPress={() => onFilterChange("all")}
                icon={
                  <Sparkles
                    size={18}
                    color={activeFilter === "all" ? "#fff" : "#6B7280"}
                  />
                }
                label="All"
                count={mapPointsData?.tips?.length || 0}
                gradient={["#3B82F6", "#6366F1"]}
              />

              <FilterButton
                active={activeFilter === "food"}
                onPress={() => onFilterChange("food")}
                icon={
                  <UtensilsCrossed
                    size={18}
                    color={activeFilter === "food" ? "#fff" : "#6B7280"}
                  />
                }
                label="Food"
                emoji="🍕"
                gradient={["#F59E0B", "#F97316"]}
              />

              <FilterButton
                active={activeFilter === "hotel"}
                onPress={() => onFilterChange("hotel")}
                icon={
                  <Hotel
                    size={18}
                    color={activeFilter === "hotel" ? "#fff" : "#6B7280"}
                  />
                }
                label="Hotels"
                emoji="🏨"
                gradient={["#8B5CF6", "#A855F7"]}
              />

              <FilterButton
                active={activeFilter === "transport"}
                onPress={() => onFilterChange("transport")}
                icon={
                  <Car
                    size={18}
                    color={activeFilter === "transport" ? "#fff" : "#6B7280"}
                  />
                }
                label="Transit"
                emoji="🚕"
                gradient={["#10B981", "#14B8A6"]}
              />

              <FilterButton
                active={activeFilter === "excursion"}
                onPress={() => onFilterChange("excursion")}
                icon={
                  <Compass
                    size={18}
                    color={activeFilter === "excursion" ? "#fff" : "#6B7280"}
                  />
                }
                label="Tours"
                emoji="🎯"
                gradient={["#3B82F6", "#2563EB"]}
              />
            </View>
          </ScrollView>
        </View>
      </BlurView>
    </Animated.View>
  );
}

function FilterButton({
  active,
  onPress,
  icon,
  label,
  count,
  emoji,
  gradient,
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: active ? gradient[0] : "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: active ? 0.4 : 0,
        shadowRadius: 8,
      }}
    >
      {active ? (
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingHorizontal: 18,
            paddingVertical: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          {icon}
          <Text
            style={{
              color: "#fff",
              fontWeight: "700",
              fontSize: 15,
              letterSpacing: 0.3,
            }}
          >
            {label}
          </Text>
          {emoji && <Text style={{ fontSize: 16 }}>{emoji}</Text>}
          {count !== undefined && (
            <View
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                borderRadius: 10,
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#fff" }}>
                {count}
              </Text>
            </View>
          )}
        </LinearGradient>
      ) : (
        <View
          style={{
            backgroundColor: "#F9FAFB",
            paddingHorizontal: 18,
            paddingVertical: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            borderWidth: 1.5,
            borderColor: "#E5E7EB",
            borderRadius: 16,
          }}
        >
          {icon}
          <Text
            style={{
              color: "#6B7280",
              fontWeight: "600",
              fontSize: 15,
            }}
          >
            {label}
          </Text>
          {emoji && <Text style={{ fontSize: 16, opacity: 0.6 }}>{emoji}</Text>}
        </View>
      )}
    </TouchableOpacity>
  );
}
