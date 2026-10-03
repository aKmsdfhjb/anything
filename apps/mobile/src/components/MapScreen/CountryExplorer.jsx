import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MapPin, Star, TrendingUp } from "lucide-react-native";

export default function CountryExplorer({
  country,
  destinations,
  onDestinationPress,
  onClose,
}) {
  const countryDestinations = destinations.filter((d) => d.country === country);

  return (
    <View
      style={{
        backgroundColor: "#1E293B",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: 400,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 24, fontWeight: "900", color: "#fff" }}>
            {country}
          </Text>
          <Text style={{ fontSize: 14, color: "#94A3B8", marginTop: 2 }}>
            {countryDestinations.length} destinations
          </Text>
        </View>
        <TouchableOpacity
          onPress={onClose}
          style={{
            backgroundColor: "#0F172A",
            padding: 10,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
            ✕
          </Text>
        </TouchableOpacity>
      </View>

      {/* Destinations List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {countryDestinations.length === 0 ? (
          <View
            style={{
              padding: 40,
              alignItems: "center",
              backgroundColor: "#0F172A",
              borderRadius: 16,
            }}
          >
            <MapPin size={48} color="#475569" />
            <Text
              style={{
                color: "#94A3B8",
                fontSize: 15,
                marginTop: 12,
                fontWeight: "600",
              }}
            >
              No destinations yet
            </Text>
            <Text style={{ color: "#64748B", fontSize: 13, marginTop: 4 }}>
              Be the first to add a tip!
            </Text>
          </View>
        ) : (
          countryDestinations.map((destination) => (
            <TouchableOpacity
              key={destination.id}
              onPress={() => onDestinationPress(destination)}
              style={{
                backgroundColor: "#0F172A",
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  backgroundColor: "#3B82F6",
                  padding: 12,
                  borderRadius: 12,
                  marginRight: 12,
                }}
              >
                <MapPin size={24} color="#fff" />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "800",
                    color: "#fff",
                    marginBottom: 4,
                  }}
                >
                  {destination.name}
                </Text>
                {destination.description && (
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#94A3B8",
                      marginBottom: 6,
                    }}
                    numberOfLines={2}
                  >
                    {destination.description}
                  </Text>
                )}

                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <View
                    style={{
                      backgroundColor: "#10B98120",
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 6,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <TrendingUp size={12} color="#10B981" />
                    <Text
                      style={{
                        color: "#10B981",
                        fontSize: 11,
                        fontWeight: "700",
                        marginLeft: 4,
                      }}
                    >
                      Popular
                    </Text>
                  </View>
                </View>
              </View>

              <View style={{ alignItems: "flex-end" }}>
                <View
                  style={{
                    backgroundColor: "#F59E0B20",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Star size={14} color="#F59E0B" fill="#F59E0B" />
                  <Text
                    style={{
                      color: "#F59E0B",
                      fontSize: 13,
                      fontWeight: "800",
                      marginLeft: 4,
                    }}
                  >
                    4.5
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
