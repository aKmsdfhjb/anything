import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { ChevronDown } from "lucide-react-native";

export function DestinationSelector({
  selectedDestination,
  destinations,
  showDestinations,
  onToggle,
  onSelect,
}) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: "#374151",
          marginBottom: 8,
        }}
      >
        Destination
      </Text>
      <TouchableOpacity
        onPress={onToggle}
        style={{
          backgroundColor: "#fff",
          padding: 16,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#E5E7EB",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 16,
            color: selectedDestination ? "#111827" : "#9CA3AF",
          }}
        >
          {selectedDestination
            ? `${selectedDestination.name}, ${selectedDestination.country}`
            : "Select a destination"}
        </Text>
        <ChevronDown color="#6B7280" size={20} />
      </TouchableOpacity>
      {showDestinations && (
        <View
          style={{
            backgroundColor: "#fff",
            marginTop: 8,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#E5E7EB",
            maxHeight: 200,
          }}
        >
          <ScrollView>
            {destinations.map((dest) => (
              <TouchableOpacity
                key={dest.id}
                onPress={() => onSelect(dest)}
                style={{
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: "#F3F4F6",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: "#111827",
                    fontWeight: "500",
                  }}
                >
                  {dest.name}
                </Text>
                <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                  {dest.country}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
