import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  Users,
  UserPlus,
  Search,
  X,
  Check,
  UserCheck,
  UserMinus,
  Clock,
} from "lucide-react-native";
import { Image } from "expo-image";

export function FriendsSection({
  friends,
  pendingRequests,
  onSearch,
  onSendRequest,
  onAccept,
  onDecline,
  onUnfriend,
}) {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("friends");

  const handleSearch = useCallback(
    async (text) => {
      setSearchQuery(text);
      if (text.length < 2) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      try {
        const results = await onSearch(text);
        setSearchResults(results);
      } catch (e) {
        console.error("Search error:", e);
      } finally {
        setSearching(false);
      }
    },
    [onSearch],
  );

  const handleAdd = useCallback(
    (userId, username) => {
      onSendRequest(userId);
      // Optimistically update search results
      setSearchResults((prev) =>
        prev.map((u) =>
          u.user_id === userId ? { ...u, friend_status: "request_sent" } : u,
        ),
      );
    },
    [onSendRequest],
  );

  const handleUnfriend = useCallback(
    (userId, username) => {
      Alert.alert("Remove Friend", `Remove ${username} as a friend?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => onUnfriend(userId),
        },
      ]);
    },
    [onUnfriend],
  );

  const renderAvatar = (user) => {
    if (user.profile_image) {
      return (
        <Image
          source={{ uri: user.profile_image }}
          style={{ width: 44, height: 44, borderRadius: 22 }}
        />
      );
    }
    return (
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: "#FF006E",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 18 }}>
          {user.username?.[0]?.toUpperCase() || "?"}
        </Text>
      </View>
    );
  };

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Users size={20} color="#FF006E" />
          <Text style={{ fontSize: 18, fontWeight: "900", color: "#111827" }}>
            Friends
          </Text>
          {pendingRequests.length > 0 && (
            <View
              style={{
                backgroundColor: "#FF006E",
                paddingHorizontal: 7,
                paddingVertical: 2,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>
                {pendingRequests.length}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={() => setShowSearch(!showSearch)}
          style={{ backgroundColor: "#FF006E", padding: 10, borderRadius: 12 }}
        >
          <UserPlus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      {showSearch && (
        <View
          style={{
            backgroundColor: "#F3F4F6",
            borderRadius: 12,
            padding: 12,
            marginBottom: 14,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#fff",
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 10,
            }}
          >
            <Search size={16} color="#9CA3AF" />
            <TextInput
              value={searchQuery}
              onChangeText={handleSearch}
              placeholder="Search by username..."
              placeholderTextColor="#9CA3AF"
              style={{ flex: 1, marginLeft: 8, fontSize: 14, color: "#111827" }}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                }}
              >
                <X size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {searching && (
            <ActivityIndicator
              size="small"
              color="#FF006E"
              style={{ marginVertical: 10 }}
            />
          )}

          {searchResults.map((u) => (
            <View
              key={u.user_id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#fff",
                padding: 10,
                borderRadius: 10,
                marginBottom: 6,
                gap: 10,
              }}
            >
              {renderAvatar(u)}
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontWeight: "700", color: "#111827", fontSize: 14 }}
                >
                  {u.username}
                </Text>
                {u.bio && (
                  <Text
                    style={{ fontSize: 12, color: "#6B7280" }}
                    numberOfLines={1}
                  >
                    {u.bio}
                  </Text>
                )}
              </View>

              {u.friend_status === "friends" ? (
                <View
                  style={{
                    backgroundColor: "#D1FAE5",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <UserCheck size={12} color="#065F46" />
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      color: "#065F46",
                    }}
                  >
                    Friends
                  </Text>
                </View>
              ) : u.friend_status === "request_sent" ? (
                <View
                  style={{
                    backgroundColor: "#F3F4F6",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Clock size={12} color="#6B7280" />
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      color: "#6B7280",
                    }}
                  >
                    Sent
                  </Text>
                </View>
              ) : u.friend_status === "request_received" ? (
                <TouchableOpacity
                  onPress={() => handleAdd(u.user_id, u.username)}
                  style={{
                    backgroundColor: "#10B981",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Check size={12} color="#fff" />
                  <Text
                    style={{ fontSize: 11, fontWeight: "700", color: "#fff" }}
                  >
                    Accept
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => handleAdd(u.user_id, u.username)}
                  style={{
                    backgroundColor: "#FF006E",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <UserPlus size={12} color="#fff" />
                  <Text
                    style={{ fontSize: 11, fontWeight: "700", color: "#fff" }}
                  >
                    Add
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {searchQuery.length >= 2 &&
            !searching &&
            searchResults.length === 0 && (
              <Text
                style={{
                  textAlign: "center",
                  color: "#6B7280",
                  fontSize: 13,
                  paddingVertical: 12,
                }}
              >
                No users found
              </Text>
            )}
        </View>
      )}

      {/* Tabs */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
        <TouchableOpacity
          onPress={() => setActiveTab("friends")}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 12,
            backgroundColor: activeTab === "friends" ? "#FF006E" : "#F3F4F6",
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: activeTab === "friends" ? "#fff" : "#6B7280",
            }}
          >
            Friends ({friends.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("pending")}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 12,
            backgroundColor: activeTab === "pending" ? "#FF006E" : "#F3F4F6",
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: activeTab === "pending" ? "#fff" : "#6B7280",
            }}
          >
            Requests
          </Text>
          {pendingRequests.length > 0 && (
            <View
              style={{
                backgroundColor:
                  activeTab === "pending" ? "rgba(255,255,255,0.3)" : "#FF006E",
                paddingHorizontal: 5,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>
                {pendingRequests.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Friends List */}
      {activeTab === "friends" &&
        (friends.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 30 }}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>👋</Text>
            <Text
              style={{ fontWeight: "600", color: "#374151", marginBottom: 4 }}
            >
              No friends yet
            </Text>
            <Text style={{ fontSize: 13, color: "#6B7280" }}>
              Tap the + button to find people!
            </Text>
          </View>
        ) : (
          friends.map((friend) => (
            <View
              key={friend.user_id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: "#F3F4F6",
                gap: 10,
              }}
            >
              {renderAvatar(friend)}
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontWeight: "700", color: "#111827", fontSize: 15 }}
                >
                  {friend.username}
                </Text>
                {friend.bio && (
                  <Text
                    style={{ fontSize: 12, color: "#6B7280" }}
                    numberOfLines={1}
                  >
                    {friend.bio}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => handleUnfriend(friend.user_id, friend.username)}
                style={{ padding: 8 }}
              >
                <UserMinus size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          ))
        ))}

      {/* Pending Requests */}
      {activeTab === "pending" &&
        (pendingRequests.length === 0 ? (
          <Text
            style={{
              textAlign: "center",
              color: "#6B7280",
              paddingVertical: 30,
              fontSize: 14,
            }}
          >
            No pending requests
          </Text>
        ) : (
          pendingRequests.map((req) => (
            <View
              key={req.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#FFF0F6",
                padding: 12,
                borderRadius: 12,
                marginBottom: 8,
                gap: 10,
              }}
            >
              {renderAvatar(req)}
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontWeight: "700", color: "#111827", fontSize: 14 }}
                >
                  {req.username}
                </Text>
                <Text style={{ fontSize: 12, color: "#6B7280" }}>
                  wants to be your friend
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: 6 }}>
                <TouchableOpacity
                  onPress={() => onAccept(req.id)}
                  style={{
                    backgroundColor: "#10B981",
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Check size={14} color="#fff" />
                  <Text
                    style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}
                  >
                    Accept
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onDecline(req.id)}
                  style={{
                    backgroundColor: "#E5E7EB",
                    padding: 8,
                    borderRadius: 10,
                  }}
                >
                  <X size={14} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ))}
    </View>
  );
}
