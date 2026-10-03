import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Filter, Search, X, Check } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export function TripFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  hasActiveFilters,
  tripCount,
  totalCount,
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);
  const insets = useSafeAreaInsets();

  const applyFilters = () => {
    onFiltersChange(tempFilters);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      status: "all",
      timeframe: "all",
      destination: "",
      ownership: "all",
      searchQuery: "",
    };
    setTempFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    setShowFilters(false);
  };

  const FilterOption = ({ title, value, options, onSelect }) => (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          color: "#94A3B8",
          fontSize: 14,
          fontWeight: "600",
          marginBottom: 12,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={{
              backgroundColor: value === option.value ? "#3B82F6" : "#1E293B",
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: value === option.value ? "#3B82F6" : "#334155",
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "600",
                fontSize: 14,
              }}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <>
      {/* Search Bar and Filter Button */}
      <View
        style={{
          backgroundColor: "#1E293B",
          margin: 20,
          marginBottom: 12,
          borderRadius: 16,
          padding: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#0F172A",
              borderRadius: 12,
              paddingHorizontal: 12,
              borderWidth: 2,
              borderColor: "#334155",
            }}
          >
            <Search size={18} color="#64748B" style={{ marginRight: 8 }} />
            <TextInput
              value={filters.searchQuery}
              onChangeText={(text) =>
                onFiltersChange({ ...filters, searchQuery: text })
              }
              placeholder="Search trips..."
              placeholderTextColor="#64748B"
              style={{
                flex: 1,
                color: "#fff",
                fontSize: 16,
                paddingVertical: 12,
              }}
            />
          </View>

          <TouchableOpacity
            onPress={() => setShowFilters(true)}
            style={{
              backgroundColor: hasActiveFilters ? "#3B82F6" : "#334155",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Filter size={18} color="#fff" />
            <Text
              style={{
                color: "#fff",
                fontWeight: "600",
                fontSize: 14,
              }}
            >
              {hasActiveFilters ? "Filtered" : "Filter"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <View style={{ marginTop: 12 }}>
            <Text
              style={{
                color: "#94A3B8",
                fontSize: 12,
                marginBottom: 8,
              }}
            >
              Showing {tripCount} of {totalCount} trips
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 6,
              }}
            >
              {filters.status !== "all" && (
                <View
                  style={{
                    backgroundColor: "#3B82F630",
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "#3B82F6",
                      fontSize: 11,
                      fontWeight: "600",
                    }}
                  >
                    {filters.status}
                  </Text>
                </View>
              )}
              {filters.timeframe !== "all" && (
                <View
                  style={{
                    backgroundColor: "#10B98130",
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "#10B981",
                      fontSize: 11,
                      fontWeight: "600",
                    }}
                  >
                    {filters.timeframe}
                  </Text>
                </View>
              )}
              {filters.ownership !== "all" && (
                <View
                  style={{
                    backgroundColor: "#F59E0B30",
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "#F59E0B",
                      fontSize: 11,
                      fontWeight: "600",
                    }}
                  >
                    {filters.ownership}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                onPress={onClearFilters}
                style={{
                  backgroundColor: "#EF444430",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{ color: "#EF4444", fontSize: 11, fontWeight: "600" }}
                >
                  Clear
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#0F172A",
            paddingTop: insets.top,
          }}
        >
          {/* Header */}
          <LinearGradient
            colors={["#3B82F6", "#2563EB"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingHorizontal: 20,
              paddingVertical: 16,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 20,
                fontWeight: "900",
              }}
            >
              Filter Trips
            </Text>
            <TouchableOpacity
              onPress={() => setShowFilters(false)}
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                padding: 8,
                borderRadius: 8,
              }}
            >
              <X size={20} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20 }}
          >
            {/* Status Filter */}
            <FilterOption
              title="Status"
              value={tempFilters.status}
              onSelect={(value) =>
                setTempFilters({ ...tempFilters, status: value })
              }
              options={[
                { label: "All", value: "all" },
                { label: "Planned", value: "planned" },
                { label: "Upcoming", value: "upcoming" },
                { label: "Completed", value: "completed" },
                { label: "Cancelled", value: "cancelled" },
              ]}
            />

            {/* Timeframe Filter */}
            <FilterOption
              title="Timeframe"
              value={tempFilters.timeframe}
              onSelect={(value) =>
                setTempFilters({ ...tempFilters, timeframe: value })
              }
              options={[
                { label: "All Time", value: "all" },
                { label: "Upcoming", value: "upcoming" },
                { label: "Past", value: "past" },
                { label: "This Month", value: "this-month" },
                { label: "This Year", value: "this-year" },
              ]}
            />

            {/* Ownership Filter */}
            <FilterOption
              title="Trip Type"
              value={tempFilters.ownership}
              onSelect={(value) =>
                setTempFilters({ ...tempFilters, ownership: value })
              }
              options={[
                { label: "All Trips", value: "all" },
                { label: "My Trips", value: "own" },
                { label: "Shared", value: "shared" },
              ]}
            />

            {/* Destination Filter */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  color: "#94A3B8",
                  fontSize: 14,
                  fontWeight: "600",
                  marginBottom: 12,
                }}
              >
                Destination
              </Text>
              <TextInput
                value={tempFilters.destination}
                onChangeText={(text) =>
                  setTempFilters({ ...tempFilters, destination: text })
                }
                placeholder="Filter by destination..."
                placeholderTextColor="#64748B"
                style={{
                  backgroundColor: "#1E293B",
                  color: "#fff",
                  padding: 14,
                  borderRadius: 12,
                  fontSize: 16,
                  borderWidth: 2,
                  borderColor: "#334155",
                }}
              />
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View
            style={{
              padding: 20,
              paddingBottom: insets.bottom + 20,
              gap: 12,
            }}
          >
            <TouchableOpacity
              onPress={applyFilters}
              style={{
                backgroundColor: "#10B981",
                padding: 18,
                borderRadius: 14,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 17,
                  fontWeight: "800",
                }}
              >
                Apply Filters
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleClearFilters}
              style={{
                backgroundColor: "#374151",
                padding: 18,
                borderRadius: 14,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 17,
                  fontWeight: "800",
                }}
              >
                Clear All Filters
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
