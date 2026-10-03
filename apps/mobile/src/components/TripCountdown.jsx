import { useState, useEffect } from "react";
import { View, Text, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Calendar, Clock, MapPin, Plane } from "lucide-react-native";
import { Image } from "expo-image";

export default function TripCountdown({ trip }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const tripDate = new Date(trip.start_date);
      const diff = tripDate - now;

      if (diff <= 0) {
        setTimeLeft({ expired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    // Pulse animation for upcoming trips
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    return () => clearInterval(timer);
  }, [trip.start_date]);

  if (!timeLeft) return null;

  const isToday = timeLeft.days === 0;
  const isSoon = timeLeft.days <= 7;

  return (
    <Animated.View
      style={{
        marginBottom: 16,
        transform: [{ scale: isToday ? pulseAnim : 1 }],
      }}
    >
      <View
        style={{
          borderRadius: 20,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 12,
        }}
      >
        {/* Background Image */}
        {trip.image_url && (
          <Image
            source={{ uri: trip.image_url }}
            style={{ width: "100%", height: 200, position: "absolute" }}
            contentFit="cover"
            transition={300}
          />
        )}

        {/* Gradient Overlay */}
        <LinearGradient
          colors={
            isToday
              ? ["rgba(239, 68, 68, 0.95)", "rgba(220, 38, 38, 0.98)"]
              : isSoon
                ? ["rgba(245, 158, 11, 0.95)", "rgba(217, 119, 6, 0.98)"]
                : ["rgba(59, 130, 246, 0.95)", "rgba(37, 99, 235, 0.98)"]
          }
          style={{ width: "100%", padding: 20 }}
        >
          {/* Trip Header */}
          <View style={{ marginBottom: 16 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.3)",
                  padding: 8,
                  borderRadius: 12,
                  marginRight: 10,
                }}
              >
                <Plane size={20} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "900",
                    color: "#FFF",
                    marginBottom: 2,
                  }}
                  numberOfLines={1}
                >
                  {trip.trip_name}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MapPin size={14} color="#FFF" />
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#FFF",
                      marginLeft: 4,
                      fontWeight: "600",
                      opacity: 0.95,
                    }}
                  >
                    {trip.destination_name}, {trip.country}
                  </Text>
                </View>
              </View>
            </View>

            {isToday && (
              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.95)",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  alignSelf: "flex-start",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "900",
                    color: "#EF4444",
                    letterSpacing: 1,
                  }}
                >
                  🎉 TODAY IS THE DAY!
                </Text>
              </View>
            )}
          </View>

          {/* Countdown Timer */}
          {!timeLeft.expired && (
            <View>
              <Text
                style={{
                  fontSize: 12,
                  color: "#FFF",
                  opacity: 0.9,
                  fontWeight: "700",
                  marginBottom: 12,
                  letterSpacing: 1,
                }}
              >
                {isToday
                  ? "DEPARTING IN"
                  : isSoon
                    ? "DEPARTING SOON"
                    : "TIME UNTIL DEPARTURE"}
              </Text>

              <View style={{ flexDirection: "row", gap: 10 }}>
                {/* Days */}
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      backgroundColor: "rgba(255,255,255,0.25)",
                      padding: 12,
                      borderRadius: 16,
                      alignItems: "center",
                      borderWidth: 2,
                      borderColor: "rgba(255,255,255,0.3)",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 28,
                        fontWeight: "900",
                        color: "#FFF",
                        lineHeight: 32,
                      }}
                    >
                      {timeLeft.days}
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#FFF",
                        opacity: 0.85,
                        fontWeight: "700",
                        marginTop: 2,
                      }}
                    >
                      DAYS
                    </Text>
                  </View>
                </View>

                {/* Hours */}
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      backgroundColor: "rgba(255,255,255,0.25)",
                      padding: 12,
                      borderRadius: 16,
                      alignItems: "center",
                      borderWidth: 2,
                      borderColor: "rgba(255,255,255,0.3)",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 28,
                        fontWeight: "900",
                        color: "#FFF",
                        lineHeight: 32,
                      }}
                    >
                      {timeLeft.hours}
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#FFF",
                        opacity: 0.85,
                        fontWeight: "700",
                        marginTop: 2,
                      }}
                    >
                      HRS
                    </Text>
                  </View>
                </View>

                {/* Minutes */}
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      backgroundColor: "rgba(255,255,255,0.25)",
                      padding: 12,
                      borderRadius: 16,
                      alignItems: "center",
                      borderWidth: 2,
                      borderColor: "rgba(255,255,255,0.3)",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 28,
                        fontWeight: "900",
                        color: "#FFF",
                        lineHeight: 32,
                      }}
                    >
                      {timeLeft.minutes}
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#FFF",
                        opacity: 0.85,
                        fontWeight: "700",
                        marginTop: 2,
                      }}
                    >
                      MIN
                    </Text>
                  </View>
                </View>

                {/* Seconds */}
                {isToday && (
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        backgroundColor: "rgba(255,255,255,0.25)",
                        padding: 12,
                        borderRadius: 16,
                        alignItems: "center",
                        borderWidth: 2,
                        borderColor: "rgba(255,255,255,0.3)",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 28,
                          fontWeight: "900",
                          color: "#FFF",
                          lineHeight: 32,
                        }}
                      >
                        {timeLeft.seconds}
                      </Text>
                      <Text
                        style={{
                          fontSize: 10,
                          color: "#FFF",
                          opacity: 0.85,
                          fontWeight: "700",
                          marginTop: 2,
                        }}
                      >
                        SEC
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Trip Date */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 16,
              backgroundColor: "rgba(255,255,255,0.2)",
              padding: 10,
              borderRadius: 12,
            }}
          >
            <Calendar size={16} color="#FFF" />
            <Text
              style={{
                fontSize: 13,
                color: "#FFF",
                marginLeft: 8,
                fontWeight: "700",
              }}
            >
              {new Date(trip.start_date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>

          {/* Notes */}
          {trip.notes && (
            <View
              style={{
                marginTop: 12,
                backgroundColor: "rgba(255,255,255,0.2)",
                padding: 12,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: "#FFF",
                  fontStyle: "italic",
                  opacity: 0.95,
                }}
                numberOfLines={2}
              >
                {trip.notes}
              </Text>
            </View>
          )}
        </LinearGradient>
      </View>
    </Animated.View>
  );
}
