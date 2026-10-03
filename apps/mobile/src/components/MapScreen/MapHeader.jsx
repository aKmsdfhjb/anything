import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { MapPinned, Filter } from "lucide-react-native";
import { Image } from "expo-image";

export function MapHeader({
  insets,
  mapPoints,
  destinations,
  showFilters,
  onToggleFilters,
}) {
  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        paddingTop: insets.top,
      }}
    >
      <BlurView
        intensity={90}
        tint="light"
        style={{
          overflow: "hidden",
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      >
        <LinearGradient
          colors={["rgba(255, 255, 255, 0.95)", "rgba(255, 255, 255, 0.88)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            paddingBottom: 20,
            paddingTop: 12,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            borderBottomWidth: 1,
            borderBottomColor: "rgba(255, 255, 255, 0.6)",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 24,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              {/* Glass Icon Badge */}
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  overflow: "hidden",
                }}
              >
                <BlurView intensity={60} tint="light" style={{ flex: 1 }}>
                  <LinearGradient
                    colors={[
                      "rgba(59, 130, 246, 0.3)",
                      "rgba(139, 92, 246, 0.3)",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                      borderWidth: 2,
                      borderColor: "rgba(255, 255, 255, 0.5)",
                      borderRadius: 26,
                    }}
                  >
                    <MapPinned size={28} color="#3B82F6" strokeWidth={2.5} />
                  </LinearGradient>
                </BlurView>
              </View>

              <View>
                <Image
                  source={{
                    uri: "https://ucarecdn.com/d3629103-1427-4fc1-a340-745b33e86ba3/-/format/auto/",
                  }}
                  style={{ width: 120, height: 32 }}
                  contentFit="contain"
                />
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 2,
                  }}
                >
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: "#10B981",
                      shadowColor: "#10B981",
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.6,
                      shadowRadius: 4,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#64748B",
                      fontWeight: "600",
                      letterSpacing: 0.2,
                    }}
                  >
                    {mapPoints.length} tips • {destinations.length} places
                  </Text>
                </View>
              </View>
            </View>

            {/* Filter Button with Glass */}
            <TouchableOpacity
              onPress={onToggleFilters}
              activeOpacity={0.7}
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                overflow: "hidden",
              }}
            >
              <BlurView
                intensity={showFilters ? 70 : 50}
                tint="light"
                style={{ flex: 1 }}
              >
                <LinearGradient
                  colors={
                    showFilters
                      ? ["rgba(59, 130, 246, 0.4)", "rgba(99, 102, 241, 0.4)"]
                      : ["rgba(255, 255, 255, 0.3)", "rgba(255, 255, 255, 0.2)"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 2,
                    borderColor: showFilters
                      ? "rgba(59, 130, 246, 0.5)"
                      : "rgba(255, 255, 255, 0.5)",
                    borderRadius: 26,
                    shadowColor: showFilters ? "#3B82F6" : "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: showFilters ? 0.3 : 0.08,
                    shadowRadius: 8,
                  }}
                >
                  <Filter
                    size={24}
                    color={showFilters ? "#3B82F6" : "#64748B"}
                    strokeWidth={2.5}
                  />
                </LinearGradient>
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* Subtle bottom accent line */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 20,
              right: 20,
              height: 1,
              backgroundColor: "rgba(148, 163, 184, 0.2)",
            }}
          />
        </LinearGradient>
      </BlurView>
    </View>
  );
}
