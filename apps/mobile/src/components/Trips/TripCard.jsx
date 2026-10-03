import { View, Text, TouchableOpacity } from "react-native";
import {
  MapPin,
  Calendar,
  FileText,
  Trash2,
  ChevronRight,
  Users,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { calculateCountdown } from "@/utils/tripHelpers";

export function TripCard({ trip, onPress, onDelete }) {
  const countdown = calculateCountdown(trip.start_date);
  const isToday = countdown.days === 0;
  const isSoon = countdown.days <= 7 && countdown.days > 0;
  const isShared = trip.is_collaborator;
  const destinationLabel =
    trip.destination_name || trip.custom_destination || "Unknown destination";
  const countryLabel =
    trip.country && trip.country !== "" ? `, ${trip.country}` : "";

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View
        style={{
          marginBottom: 16,
          borderRadius: 20,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
        }}
      >
        {/* Cover image */}
        {trip.cover_image ? (
          <View style={{ position: "relative" }}>
            <Image
              source={{ uri: trip.cover_image }}
              style={{ width: "100%", height: 160 }}
              contentFit="cover"
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.75)"]}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 80,
              }}
            />
          </View>
        ) : null}

        <LinearGradient
          colors={
            isToday
              ? ["#EF4444", "#DC2626"]
              : isSoon
                ? ["#F59E0B", "#D97706"]
                : countdown.isUpcoming
                  ? isShared
                    ? ["#8B5CF6", "#7C3AED"]
                    : ["#3B82F6", "#2563EB"]
                  : ["#64748B", "#475569"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 20 }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <View style={{ flex: 1 }}>
              {isShared && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "rgba(255,255,255,0.2)",
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 8,
                    alignSelf: "flex-start",
                    marginBottom: 10,
                  }}
                >
                  <Users size={14} color="#fff" />
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: "800",
                      marginLeft: 6,
                    }}
                  >
                    Shared by {trip.owner_username || "a friend"}
                  </Text>
                </View>
              )}

              {isToday && (
                <View
                  style={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    alignSelf: "flex-start",
                    marginBottom: 12,
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

              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "900",
                  color: "#fff",
                  marginBottom: 10,
                }}
              >
                {trip.trip_name}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <MapPin size={16} color="#fff" />
                <Text
                  style={{
                    color: "#fff",
                    marginLeft: 8,
                    fontSize: 15,
                    opacity: 0.95,
                    fontWeight: "600",
                  }}
                >
                  {destinationLabel}
                  {countryLabel}
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  padding: 12,
                  borderRadius: 12,
                  marginBottom: 12,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Calendar size={16} color="#fff" />
                  <Text
                    style={{
                      color: "#fff",
                      marginLeft: 8,
                      fontSize: 14,
                      fontWeight: "700",
                    }}
                  >
                    {new Date(trip.start_date).toLocaleDateString("en-GB", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Text>
                </View>
              </View>

              {countdown.isUpcoming && (
                <View
                  style={{
                    backgroundColor: "rgba(255,255,255,0.25)",
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 12,
                    alignSelf: "flex-start",
                    borderWidth: 2,
                    borderColor: "rgba(255,255,255,0.3)",
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontWeight: "900", fontSize: 18 }}
                  >
                    ⏱️ {countdown.text}
                  </Text>
                </View>
              )}

              {trip.description && (
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
                      color: "#fff",
                      fontSize: 14,
                      fontStyle: "italic",
                      opacity: 0.95,
                    }}
                  >
                    {trip.description}
                  </Text>
                </View>
              )}
            </View>

            <View style={{ flexDirection: "row", gap: 8, marginLeft: 12 }}>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onPress();
                }}
                style={{
                  backgroundColor: "rgba(255,255,255,0.25)",
                  padding: 10,
                  borderRadius: 12,
                }}
              >
                <FileText size={22} color="#fff" />
              </TouchableOpacity>
              {!isShared && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    onDelete(trip.id);
                  }}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    padding: 10,
                    borderRadius: 12,
                  }}
                >
                  <Trash2 size={22} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <TouchableOpacity
            onPress={onPress}
            style={{
              marginTop: 16,
              backgroundColor: "rgba(255,255,255,0.2)",
              padding: 12,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2,
              borderColor: "rgba(255,255,255,0.3)",
            }}
          >
            <FileText size={18} color="#fff" />
            <Text
              style={{
                color: "#fff",
                fontWeight: "800",
                fontSize: 15,
                marginLeft: 8,
                marginRight: 4,
              }}
            >
              {isShared ? "View Shared Trip" : "View Trip Details"}
            </Text>
            <ChevronRight size={18} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
}
