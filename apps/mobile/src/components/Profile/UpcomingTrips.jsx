import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Plane, Plus } from "lucide-react-native";
import TripCountdown from "@/components/TripCountdown";

export function UpcomingTrips({ tripsData, tripsLoading }) {
  const handleAddTrip = () => {
    Alert.alert(
      "Add Trip",
      "Go to the Trips tab to plan your next adventure!",
      [{ text: "OK" }],
    );
  };

  const upcomingTrips = tripsData?.trips
    ? tripsData.trips
        .filter((trip) => new Date(trip.start_date) >= new Date())
        .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
    : [];

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Plane size={20} color="#3B82F6" />
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "#111827",
            }}
          >
            Upcoming Trips
          </Text>
          {tripsData?.trips?.length > 0 && (
            <View
              style={{
                backgroundColor: "#3B82F6",
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 10,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: "bold",
                }}
              >
                {tripsData.trips.length}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={handleAddTrip}
          style={{
            backgroundColor: "#3B82F6",
            padding: 8,
            borderRadius: 10,
          }}
        >
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {tripsLoading ? (
        <ActivityIndicator size="small" color="#3B82F6" />
      ) : tripsData?.trips?.length === 0 ? (
        <View
          style={{
            padding: 32,
            backgroundColor: "#F3F4F6",
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 48, marginBottom: 8 }}>✈️</Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 4,
            }}
          >
            No trips planned yet
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#6B7280",
              textAlign: "center",
            }}
          >
            Start planning your next adventure!
          </Text>
        </View>
      ) : (
        upcomingTrips.map((trip) => <TripCountdown key={trip.id} trip={trip} />)
      )}
    </View>
  );
}
