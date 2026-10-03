import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { MapPin, Calendar, Check, X } from "lucide-react-native";
import { Image } from "expo-image";

export function TripInviteCard({ invite, onRespond, isResponding }) {
  const destinationLabel =
    invite.destination_name || invite.custom_destination || "Unknown";
  const countryLabel =
    invite.country && invite.country !== "" ? `, ${invite.country}` : "";

  return (
    <View
      style={{
        backgroundColor: "#1E293B",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: "#F59E0B50",
      }}
    >
      {/* Invitation message */}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
      >
        {invite.invited_by_image ? (
          <Image
            source={{ uri: invite.invited_by_image }}
            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
          />
        ) : (
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#8B5CF620",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 10,
            }}
          >
            <Text style={{ color: "#8B5CF6", fontWeight: "800", fontSize: 16 }}>
              {invite.invited_by_username?.[0]?.toUpperCase() || "?"}
            </Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: "#fff",
              fontWeight: "700",
              fontSize: 14,
              lineHeight: 20,
            }}
          >
            <Text style={{ color: "#F59E0B" }}>
              {invite.invited_by_username || "Someone"}
            </Text>
            {" has invited you to join "}
            <Text style={{ color: "#fff", fontWeight: "900" }}>
              {invite.trip_name}
            </Text>
          </Text>
        </View>
      </View>

      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}
      >
        <MapPin size={14} color="#94A3B8" />
        <Text style={{ color: "#94A3B8", marginLeft: 6, fontSize: 14 }}>
          {destinationLabel}
          {countryLabel}
        </Text>
      </View>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}
      >
        <Calendar size={14} color="#94A3B8" />
        <Text style={{ color: "#94A3B8", marginLeft: 6, fontSize: 13 }}>
          {new Date(invite.start_date).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          {invite.end_date &&
            ` → ${new Date(invite.end_date).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`}
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <TouchableOpacity
          onPress={() => onRespond(invite.id, "accepted")}
          disabled={isResponding}
          style={{
            flex: 1,
            backgroundColor: "#10B981",
            padding: 14,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            opacity: isResponding ? 0.6 : 1,
          }}
        >
          {isResponding ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Check size={18} color="#fff" />
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "800",
                  fontSize: 15,
                  marginLeft: 6,
                }}
              >
                Accept
              </Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onRespond(invite.id, "declined")}
          disabled={isResponding}
          style={{
            backgroundColor: "#EF444420",
            padding: 14,
            borderRadius: 12,
            paddingHorizontal: 20,
          }}
        >
          <X size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
