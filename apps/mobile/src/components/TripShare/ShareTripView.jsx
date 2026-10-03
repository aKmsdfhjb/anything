import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Share,
  ScrollView,
} from "react-native";
import { useState, useEffect } from "react";
import { Share2, Copy, Trash2, Mail, Check } from "lucide-react-native";
import * as Clipboard from "expo-clipboard";

export default function ShareTripView({ tripId }) {
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    loadShares();
  }, [tripId]);

  const loadShares = async () => {
    try {
      const response = await fetch(`/api/trip-shares?trip_id=${tripId}`);
      if (!response.ok) throw new Error("Failed to load shares");
      const data = await response.json();
      setShares(data.shares || []);
    } catch (error) {
      console.error("Error loading shares:", error);
    } finally {
      setLoading(false);
    }
  };

  const createShareLink = async () => {
    try {
      const response = await fetch("/api/trip-shares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trip_id: tripId,
          permission_level: "view",
        }),
      });

      if (!response.ok) throw new Error("Failed to create share link");
      const data = await response.json();

      // Copy to clipboard
      const shareUrl = `${process.env.EXPO_PUBLIC_BASE_URL}/shared-trip/${data.share.share_code}`;
      await Clipboard.setStringAsync(shareUrl);

      Alert.alert(
        "Share Link Created!",
        "Link copied to clipboard. Share it with your travel buddies!",
      );
      loadShares();
    } catch (error) {
      console.error("Error creating share link:", error);
      Alert.alert("Error", "Could not create share link");
    }
  };

  const copyShareLink = async (shareCode) => {
    const shareUrl = `${process.env.EXPO_PUBLIC_BASE_URL}/shared-trip/${shareCode}`;
    await Clipboard.setStringAsync(shareUrl);
    setCopiedCode(shareCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const shareViaSystem = async (shareCode) => {
    try {
      const shareUrl = `${process.env.EXPO_PUBLIC_BASE_URL}/shared-trip/${shareCode}`;
      await Share.share({
        message: `Check out my trip! ${shareUrl}`,
        url: shareUrl,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const deleteShare = async (shareId) => {
    Alert.alert(
      "Delete Share Link",
      "Are you sure? This link will stop working.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`/api/trip-shares?id=${shareId}`, {
                method: "DELETE",
              });
              if (!response.ok) throw new Error("Failed to delete");
              loadShares();
            } catch (error) {
              console.error("Error deleting share:", error);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Create Share Button */}
      <TouchableOpacity
        onPress={createShareLink}
        style={{
          backgroundColor: "#10B981",
          padding: 16,
          borderRadius: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <Share2 size={20} color="#fff" />
        <Text
          style={{
            color: "#fff",
            fontWeight: "800",
            fontSize: 16,
            marginLeft: 8,
          }}
        >
          Create Share Link
        </Text>
      </TouchableOpacity>

      {/* Info Box */}
      <View
        style={{
          backgroundColor: "#1E293B",
          borderRadius: 16,
          padding: 16,
          marginBottom: 20,
          borderLeftWidth: 4,
          borderLeftColor: "#3B82F6",
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 15,
            fontWeight: "700",
            marginBottom: 8,
          }}
        >
          💡 How Sharing Works
        </Text>
        <Text style={{ color: "#94A3B8", fontSize: 13, lineHeight: 20 }}>
          Create a share link to let friends and family view your trip details,
          documents, and packing list. They won't be able to edit anything.
        </Text>
      </View>

      {/* Active Shares */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: "900",
          color: "#fff",
          marginBottom: 12,
        }}
      >
        Active Share Links ({shares.length})
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {shares.length === 0 ? (
          <View
            style={{
              backgroundColor: "#1E293B",
              borderRadius: 16,
              padding: 40,
              alignItems: "center",
            }}
          >
            <Share2 size={48} color="#475569" />
            <Text
              style={{
                color: "#94A3B8",
                fontSize: 15,
                fontWeight: "600",
                marginTop: 12,
              }}
            >
              No active share links
            </Text>
            <Text style={{ color: "#64748B", fontSize: 13, marginTop: 4 }}>
              Create one to share your trip!
            </Text>
          </View>
        ) : (
          shares.map((share) => (
            <View
              key={share.id}
              style={{
                backgroundColor: "#1E293B",
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    backgroundColor: "#10B98120",
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "#10B981",
                      fontSize: 11,
                      fontWeight: "800",
                    }}
                  >
                    ACTIVE
                  </Text>
                </View>
                <Text style={{ color: "#64748B", fontSize: 12 }}>
                  {new Date(share.created_at).toLocaleDateString()}
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: "#0F172A",
                  padding: 12,
                  borderRadius: 10,
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    color: "#94A3B8",
                    fontSize: 12,
                    fontFamily: "monospace",
                  }}
                  numberOfLines={1}
                >
                  {share.share_code}
                </Text>
              </View>

              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  onPress={() => copyShareLink(share.share_code)}
                  style={{
                    flex: 1,
                    backgroundColor:
                      copiedCode === share.share_code ? "#10B981" : "#3B82F6",
                    padding: 12,
                    borderRadius: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {copiedCode === share.share_code ? (
                    <>
                      <Check size={16} color="#fff" />
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "700",
                          fontSize: 13,
                          marginLeft: 6,
                        }}
                      >
                        Copied!
                      </Text>
                    </>
                  ) : (
                    <>
                      <Copy size={16} color="#fff" />
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "700",
                          fontSize: 13,
                          marginLeft: 6,
                        }}
                      >
                        Copy
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => shareViaSystem(share.share_code)}
                  style={{
                    backgroundColor: "#8B5CF6",
                    padding: 12,
                    borderRadius: 10,
                  }}
                >
                  <Share2 size={16} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => deleteShare(share.id)}
                  style={{
                    backgroundColor: "#EF444420",
                    padding: 12,
                    borderRadius: 10,
                  }}
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
