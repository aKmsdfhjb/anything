import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  ImageBackground,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Image } from "expo-image";
import {
  X,
  Sparkles,
  Hotel,
  Plane,
  MapPin,
  ExternalLink,
  Ticket,
  Car,
  Shield,
  Globe,
} from "lucide-react-native";

const CATEGORY_CONFIG = {
  flights: { label: "Flights", emoji: "✈️", color: "#3B82F6" },
  hotels: { label: "Hotels", emoji: "🏨", color: "#8B5CF6" },
  activities: { label: "Activities", emoji: "🎫", color: "#10B981" },
  car_rental: { label: "Car Rental", emoji: "🚗", color: "#F59E0B" },
  insurance: { label: "Insurance", emoji: "🛡️", color: "#EF4444" },
  multi: { label: "Multi", emoji: "🌍", color: "#06B6D4" },
};

export function DestinationModal({
  visible,
  destination,
  insets,
  onClose,
  tips = [],
  tipsLoading = false,
  onBooking,
  affiliateLinks = [],
}) {
  if (!destination) return null;

  // Group affiliate links by category
  const groupedLinks = {};
  affiliateLinks.forEach((link) => {
    if (!groupedLinks[link.category]) groupedLinks[link.category] = [];
    groupedLinks[link.category].push(link);
  });

  const handleLinkPress = (link) => {
    Linking.openURL(link.booking_url).catch((err) =>
      console.error("Error opening URL:", err),
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: "90%",
          }}
        >
          {destination.image_url && (
            <ImageBackground
              source={{ uri: destination.image_url }}
              style={{
                height: 200,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                overflow: "hidden",
              }}
              imageStyle={{
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              }}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.3)",
                  padding: 20,
                  justifyContent: "flex-end",
                }}
              >
                <TouchableOpacity
                  onPress={onClose}
                  style={{
                    position: "absolute",
                    top: 20,
                    right: 20,
                    backgroundColor: "rgba(255,255,255,0.9)",
                    padding: 8,
                    borderRadius: 20,
                  }}
                >
                  <X color="#111827" size={24} />
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: "bold",
                    color: "#fff",
                    textShadowColor: "rgba(0,0,0,0.75)",
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 10,
                  }}
                >
                  {destination.name}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: "#fff",
                    marginTop: 4,
                    textShadowColor: "rgba(0,0,0,0.75)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 5,
                  }}
                >
                  📍 {destination.country}
                </Text>
              </View>
            </ImageBackground>
          )}

          <View style={{ padding: 20 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Sparkles color="#EC4899" size={20} />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#111827",
                  marginLeft: 8,
                }}
              >
                Book Your Adventure
              </Text>
            </View>

            {affiliateLinks.length > 0 ? (
              Object.entries(groupedLinks)
                .slice(0, 3)
                .map(([cat, links]) => {
                  const config = CATEGORY_CONFIG[cat] || {
                    label: cat,
                    emoji: "📍",
                    color: "#64748B",
                  };
                  return (
                    <View key={cat} style={{ marginBottom: 12 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "800",
                          color: config.color,
                          marginBottom: 6,
                        }}
                      >
                        {config.emoji} {config.label}
                      </Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ flexGrow: 0 }}
                      >
                        {links.map((link) => (
                          <TouchableOpacity
                            key={link.id}
                            onPress={() => handleLinkPress(link)}
                            style={{
                              backgroundColor: config.color + "15",
                              borderRadius: 12,
                              paddingHorizontal: 14,
                              paddingVertical: 10,
                              marginRight: 8,
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 13,
                                fontWeight: "700",
                                color: config.color,
                              }}
                            >
                              {link.partner_name}
                            </Text>
                            <ExternalLink size={12} color={config.color} />
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  );
                })
            ) : (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                <TouchableOpacity
                  onPress={() => onBooking("hotel", destination)}
                  style={{
                    flex: 1,
                    minWidth: "45%",
                    backgroundColor: "#8B5CF6",
                    padding: 16,
                    borderRadius: 16,
                    alignItems: "center",
                  }}
                >
                  <Hotel color="#fff" size={28} />
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: "700",
                      marginTop: 8,
                    }}
                  >
                    Hotels
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onBooking("flight", destination)}
                  style={{
                    flex: 1,
                    minWidth: "45%",
                    backgroundColor: "#3B82F6",
                    padding: 16,
                    borderRadius: 16,
                    alignItems: "center",
                  }}
                >
                  <Plane color="#fff" size={28} />
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: "700",
                      marginTop: 8,
                    }}
                  >
                    Flights
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <ScrollView
            style={{ maxHeight: 300 }}
            contentContainerStyle={{
              padding: 20,
              paddingTop: 0,
              paddingBottom: insets.bottom + 20,
            }}
          >
            {destination.description && (
              <View
                style={{
                  backgroundColor: "#FEF3C7",
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 16,
                  borderLeftWidth: 4,
                  borderLeftColor: "#F59E0B",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: "#92400E",
                    fontStyle: "italic",
                  }}
                >
                  {destination.description}
                </Text>
              </View>
            )}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "bold", color: "#111827" }}
              >
                Traveler Tips
              </Text>
              <View
                style={{
                  backgroundColor: "#EC4899",
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                  marginLeft: 8,
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}
                >
                  {tips.length}
                </Text>
              </View>
            </View>

            {tipsLoading ? (
              <ActivityIndicator
                size="small"
                color="#3B82F6"
                style={{ marginTop: 20 }}
              />
            ) : tips.length === 0 ? (
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
                  No tips yet! Be the first to share your experience 🌟
                </Text>
              </View>
            ) : (
              tips.map((tip) => (
                <View
                  key={tip.id}
                  style={{
                    backgroundColor: "#F9FAFB",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    borderLeftWidth: 4,
                    borderLeftColor:
                      tip.tip_type === "video" ? "#8B5CF6" : "#3B82F6",
                  }}
                >
                  {tip.photo_url && (
                    <Image
                      source={{ uri: tip.photo_url }}
                      style={{
                        width: "100%",
                        height: 150,
                        borderRadius: 8,
                        marginBottom: 12,
                      }}
                      contentFit="cover"
                    />
                  )}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor:
                          tip.tip_type === "video" ? "#8B5CF6" : "#3B82F6",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "bold",
                          fontSize: 14,
                        }}
                      >
                        {tip.username?.[0]?.toUpperCase() || "U"}
                      </Text>
                    </View>
                    <View style={{ marginLeft: 8, flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: "#111827",
                        }}
                      >
                        {tip.username}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#6B7280" }}>
                        {new Date(tip.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <View
                      style={{
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
                        {tip.tip_type === "video" ? "🎥 VIDEO" : "📝 TEXT"}
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
                  {tip.location_name && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 8,
                        backgroundColor: "#DBEAFE",
                        padding: 8,
                        borderRadius: 8,
                      }}
                    >
                      <MapPin size={14} color="#3B82F6" />
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#1E40AF",
                          marginLeft: 4,
                        }}
                      >
                        Posted from: {tip.location_name}
                      </Text>
                    </View>
                  )}
                  {tip.tip_type === "text" && tip.content && (
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#374151",
                        lineHeight: 20,
                      }}
                    >
                      {tip.content}
                    </Text>
                  )}
                  {tip.tip_type === "video" && tip.video_url && (
                    <Text
                      style={{ fontSize: 12, color: "#8B5CF6", marginTop: 4 }}
                    >
                      📹 Video tip available
                    </Text>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
