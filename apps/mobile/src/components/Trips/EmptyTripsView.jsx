import { View, Text, TouchableOpacity } from "react-native";
import { Plane, Search } from "lucide-react-native";

export function EmptyTripsView({ hasActiveFilters, onClearFilters }) {
  return (
    <View style={{ alignItems: "center", marginTop: 100 }}>
      <View
        style={{
          backgroundColor: hasActiveFilters
            ? "rgba(59, 130, 246, 0.1)"
            : "rgba(59, 130, 246, 0.1)",
          padding: 32,
          borderRadius: 100,
          marginBottom: 24,
        }}
      >
        {hasActiveFilters ? (
          <Search size={64} color="#3B82F6" />
        ) : (
          <Plane size={64} color="#3B82F6" />
        )}
      </View>
      <Text
        style={{
          color: "#CBD5E1",
          fontSize: 20,
          fontWeight: "700",
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        {hasActiveFilters
          ? "No trips match your filters"
          : "No trips planned yet"}
      </Text>
      <Text
        style={{
          color: "#64748B",
          fontSize: 16,
          textAlign: "center",
          paddingHorizontal: 40,
          marginBottom: hasActiveFilters ? 24 : 0,
        }}
      >
        {hasActiveFilters
          ? "Try adjusting your search or filters to find more trips"
          : "Start planning your next adventure!"}
      </Text>
      {hasActiveFilters && (
        <TouchableOpacity
          onPress={onClearFilters}
          style={{
            backgroundColor: "#3B82F6",
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: "700",
            }}
          >
            Clear Filters
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
