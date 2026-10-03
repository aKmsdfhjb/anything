import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles, X, Plane } from "lucide-react-native";

export function VacationCountdown({
  profile,
  onRemove,
  trips,
  onSetCountdown,
}) {
  const [timeLeft, setTimeLeft] = useState(null);

  const hasCountdown = !!profile?.countdown_trip_name;
  const startDate = profile?.countdown_start_date;

  useEffect(() => {
    if (!startDate) return;

    const calc = () => {
      const now = new Date();
      const target = new Date(startDate);
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft({ expired: true });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft({ days, hours, minutes, expired: false });
    };

    calc();
    const timer = setInterval(calc, 60000);
    return () => clearInterval(timer);
  }, [startDate]);

  // Show countdown if set
  if (hasCountdown && timeLeft && !timeLeft.expired) {
    return (
      <View style={{ marginBottom: 20 }}>
        <LinearGradient
          colors={["#FF006E", "#8B5CF6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 16, padding: 20 }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Sparkles size={18} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "900" }}>
                Vacation Countdown
              </Text>
            </View>
            <TouchableOpacity
              onPress={onRemove}
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                padding: 6,
                borderRadius: 8,
              }}
            >
              <X size={14} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: 13,
              marginBottom: 14,
            }}
          >
            ✈️ {profile.countdown_trip_name} —{" "}
            {profile.countdown_destination_name}, {profile.countdown_country}
          </Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 14,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <Text style={{ fontSize: 28, fontWeight: "900", color: "#fff" }}>
                {timeLeft.days}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                DAYS
              </Text>
            </View>
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 14,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <Text style={{ fontSize: 28, fontWeight: "900", color: "#fff" }}>
                {timeLeft.hours}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                HRS
              </Text>
            </View>
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 14,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <Text style={{ fontSize: 28, fontWeight: "900", color: "#fff" }}>
                {timeLeft.minutes}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                MIN
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Show trip picker if no countdown set and there are upcoming trips
  const upcomingTrips = (trips || []).filter(
    (t) =>
      new Date(t.start_date) > new Date() &&
      (t.status === "planned" || t.status === "upcoming"),
  );

  if (!hasCountdown && upcomingTrips.length > 0) {
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
            gap: 8,
            marginBottom: 8,
          }}
        >
          <Sparkles size={18} color="#FF006E" />
          <Text style={{ fontSize: 16, fontWeight: "800", color: "#111827" }}>
            Add Vacation Countdown
          </Text>
        </View>
        <Text style={{ fontSize: 13, color: "#6B7280", marginBottom: 12 }}>
          Show a countdown to your next trip on your profile!
        </Text>
        {upcomingTrips.slice(0, 4).map((trip) => (
          <TouchableOpacity
            key={trip.id}
            onPress={() => onSetCountdown(trip.id)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#F9FAFB",
              padding: 14,
              borderRadius: 12,
              marginBottom: 8,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontWeight: "700", color: "#111827", fontSize: 14 }}
              >
                {trip.trip_name}
              </Text>
              <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 2 }}>
                {trip.destination_name} •{" "}
                {new Date(trip.start_date).toLocaleDateString()}
              </Text>
            </View>
            <Plane size={16} color="#FF006E" />
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  return null;
}
