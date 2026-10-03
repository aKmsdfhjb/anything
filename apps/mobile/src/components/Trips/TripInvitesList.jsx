import { View, Text } from "react-native";
import { Bell } from "lucide-react-native";
import { TripInviteCard } from "./TripInviteCard";

export function TripInvitesList({ invites, onRespond, respondingTo }) {
  if (invites.length === 0) return null;

  return (
    <View style={{ marginBottom: 20 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Bell size={18} color="#F59E0B" />
        <Text
          style={{
            fontSize: 18,
            fontWeight: "900",
            color: "#F59E0B",
            marginLeft: 8,
          }}
        >
          Trip Invitations ({invites.length})
        </Text>
      </View>

      {invites.map((invite) => (
        <TripInviteCard
          key={invite.id}
          invite={invite}
          onRespond={onRespond}
          isResponding={respondingTo === invite.id}
        />
      ))}
    </View>
  );
}
