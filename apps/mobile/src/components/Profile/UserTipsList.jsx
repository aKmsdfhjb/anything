import { View, Text, ActivityIndicator } from "react-native";
import { MapPin } from "lucide-react-native";

export function UserTipsList({ userTips, tipsLoading }) {
  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          color: "#111827",
          marginBottom: 12,
        }}
      >
        Your Tips ({userTips.length})
      </Text>
      {tipsLoading ? (
        <ActivityIndicator size="small" color="#3B82F6" />
      ) : userTips.length === 0 ? (
        <View
          style={{
            padding: 20,
            backgroundColor: "#F3F4F6",
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: "#6B7280",
              textAlign: "center",
            }}
          >
            You haven't shared any tips yet
          </Text>
        </View>
      ) : (
        userTips.map((tip) => (
          <View
            key={tip.id}
            style={{
              backgroundColor: "#F9FAFB",
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <MapPin color="#3B82F6" size={16} />
              <Text
                style={{
                  marginLeft: 4,
                  fontSize: 12,
                  color: "#6B7280",
                }}
              >
                {tip.destination_name}, {tip.destination_country}
              </Text>
              <View
                style={{
                  marginLeft: "auto",
                  backgroundColor:
                    tip.tip_type === "video" ? "#8B5CF6" : "#3B82F6",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: "600",
                  }}
                >
                  {tip.tip_type.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "#111827",
                marginBottom: 4,
              }}
            >
              {tip.title}
            </Text>
            {tip.tip_type === "text" && tip.content && (
              <Text
                style={{
                  fontSize: 14,
                  color: "#374151",
                  lineHeight: 20,
                }}
                numberOfLines={3}
              >
                {tip.content}
              </Text>
            )}
            <Text style={{ fontSize: 12, color: "#9CA3AF", marginTop: 8 }}>
              {new Date(tip.created_at).toLocaleDateString()}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}
