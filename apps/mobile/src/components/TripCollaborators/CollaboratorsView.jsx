import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import {
  UserPlus,
  Search,
  Check,
  X,
  Users,
  Crown,
  Trash2,
} from "lucide-react-native";
import { Image } from "expo-image";
import useUser from "@/utils/auth/useUser";

export default function CollaboratorsView({ tripId }) {
  const { data: user } = useUser();
  const [collaborators, setCollaborators] = useState([]);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [inviting, setInviting] = useState(null);
  const [friendsToInvite, setFriendsToInvite] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

  useEffect(() => {
    loadCollaborators();
  }, [tripId]);

  const loadCollaborators = async () => {
    try {
      const response = await fetch(`/api/trip-collaborators?trip_id=${tripId}`);
      if (!response.ok) throw new Error("Failed to load collaborators");
      const data = await response.json();
      setOwner(data.owner || null);
      setCollaborators(data.collaborators || []);
    } catch (error) {
      console.error("Error loading collaborators:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadFriendsToInvite = async () => {
    setLoadingFriends(true);
    try {
      const res = await fetch(
        `/api/trip-collaborators?mode=friends_to_invite&trip_id=${tripId}`,
      );
      if (!res.ok) return;
      const data = await res.json();
      setFriendsToInvite(data.friends || []);
    } catch (err) {
      console.error("Load friends error:", err);
    } finally {
      setLoadingFriends(false);
    }
  };

  const toggleShowSearch = () => {
    const next = !showSearch;
    setShowSearch(next);
    if (next) {
      loadFriendsToInvite();
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const searchUsers = useCallback(
    async (query) => {
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const response = await fetch(
          `/api/trip-collaborators?mode=search_users&q=${encodeURIComponent(query)}`,
        );
        if (!response.ok) throw new Error("Search failed");
        const data = await response.json();
        // Filter out users already in the trip
        const existingIds = collaborators.map((c) => c.user_id);
        const filtered = (data.users || []).filter(
          (u) =>
            !existingIds.includes(u.user_id) && u.user_id !== owner?.user_id,
        );
        setSearchResults(filtered);
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setSearching(false);
      }
    },
    [collaborators, owner],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchUsers(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers]);

  const inviteUser = async (targetUserId) => {
    setInviting(targetUserId);
    try {
      const response = await fetch("/api/trip-collaborators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trip_id: tripId,
          user_id: targetUserId,
          role: "editor",
        }),
      });

      if (!response.ok) throw new Error("Failed to invite user");

      Alert.alert("Invited! 🎉", "They'll see the trip once they accept.");
      setSearchQuery("");
      setSearchResults([]);
      setShowSearch(false);
      loadCollaborators();
    } catch (error) {
      console.error("Error inviting user:", error);
      Alert.alert("Error", "Could not send invitation");
    } finally {
      setInviting(null);
    }
  };

  const removeCollaborator = async (collabId) => {
    Alert.alert(
      "Remove Travel Buddy",
      "They'll no longer have access to this trip.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(
                `/api/trip-collaborators?id=${collabId}&trip_id=${tripId}`,
                { method: "DELETE" },
              );
              if (!response.ok) throw new Error("Failed to remove");
              loadCollaborators();
            } catch (error) {
              console.error("Error removing collaborator:", error);
              Alert.alert("Error", "Could not remove travel buddy");
            }
          },
        },
      ],
    );
  };

  const isOwner = user && owner && user.id === owner.user_id;

  if (loading) {
    return (
      <View style={{ padding: 40, alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Invite Button */}
      <TouchableOpacity
        onPress={toggleShowSearch}
        style={{
          backgroundColor: showSearch ? "#1E293B" : "#3B82F6",
          padding: 12,
          borderRadius: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {showSearch ? (
          <>
            <X size={16} color="#94A3B8" />
            <Text
              style={{ color: "#94A3B8", fontWeight: "700", marginLeft: 8 }}
            >
              Cancel
            </Text>
          </>
        ) : (
          <>
            <UserPlus size={16} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "700", marginLeft: 8 }}>
              Invite to Travel Party
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Invite panel */}
      {showSearch && isOwner && (
        <View style={{ marginTop: 12 }}>
          {/* Search box */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#0F172A",
              borderRadius: 12,
              paddingHorizontal: 12,
              marginBottom: 12,
              borderWidth: 2,
              borderColor: "#334155",
            }}
          >
            <Search size={16} color="#64748B" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name or username…"
              placeholderTextColor="#64748B"
              style={{
                flex: 1,
                color: "#fff",
                padding: 12,
                fontSize: 15,
              }}
            />
            {searching && <ActivityIndicator size="small" color="#3B82F6" />}
          </View>

          {/* Friends from Tiptrip - shown when search is empty */}
          {!searchQuery && (
            <View>
              <Text
                style={{
                  color: "#94A3B8",
                  fontSize: 12,
                  fontWeight: "700",
                  marginBottom: 8,
                  letterSpacing: 0.5,
                }}
              >
                YOUR TIPTRIP FRIENDS
              </Text>
              {loadingFriends ? (
                <ActivityIndicator
                  color="#3B82F6"
                  style={{ marginVertical: 12 }}
                />
              ) : friendsToInvite.length === 0 ? (
                <View
                  style={{
                    backgroundColor: "#0F172A",
                    borderRadius: 12,
                    padding: 16,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#64748B",
                      fontSize: 13,
                      textAlign: "center",
                    }}
                  >
                    No Tiptrip friends to invite yet.{"\n"}Search by name or
                    username to find anyone.
                  </Text>
                </View>
              ) : (
                friendsToInvite.map((friend) => (
                  <View
                    key={friend.user_id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#0F172A",
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 8,
                    }}
                  >
                    {friend.profile_image ? (
                      <Image
                        source={{ uri: friend.profile_image }}
                        style={{ width: 40, height: 40, borderRadius: 20 }}
                      />
                    ) : (
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: "#3B82F6",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: "#fff",
                            fontWeight: "800",
                            fontSize: 16,
                          }}
                        >
                          {friend.username?.[0]?.toUpperCase() || "?"}
                        </Text>
                      </View>
                    )}
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "700",
                          fontSize: 14,
                        }}
                      >
                        @{friend.username}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => inviteUser(friend.user_id)}
                      disabled={inviting === friend.user_id}
                      style={{
                        backgroundColor: "#3B82F6",
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 10,
                      }}
                    >
                      {inviting === friend.user_id ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text
                          style={{
                            color: "#fff",
                            fontWeight: "800",
                            fontSize: 13,
                          }}
                        >
                          Invite
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          )}

          {/* Search results */}
          {searchQuery.length >= 2 &&
            searchResults.map((u) => (
              <View
                key={u.user_id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#0F172A",
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 8,
                }}
              >
                {u.profile_image ? (
                  <Image
                    source={{ uri: u.profile_image }}
                    style={{ width: 40, height: 40, borderRadius: 20 }}
                  />
                ) : (
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: "#8B5CF6",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "800",
                        fontSize: 16,
                      }}
                    >
                      {u.username?.[0]?.toUpperCase() || "?"}
                    </Text>
                  </View>
                )}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text
                    style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}
                  >
                    @{u.username}
                  </Text>
                  {u.name && (
                    <Text style={{ color: "#64748B", fontSize: 12 }}>
                      {u.name}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => inviteUser(u.user_id)}
                  disabled={inviting === u.user_id}
                  style={{
                    backgroundColor: "#3B82F6",
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 10,
                  }}
                >
                  {inviting === u.user_id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text
                      style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}
                    >
                      Invite
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}

          {searchQuery.length >= 2 &&
            !searching &&
            searchResults.length === 0 && (
              <View
                style={{
                  backgroundColor: "#0F172A",
                  borderRadius: 12,
                  padding: 16,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#64748B", fontSize: 13 }}>
                  No users found for "{searchQuery}"
                </Text>
              </View>
            )}
        </View>
      )}

      {/* Info Box */}
      <View
        style={{
          backgroundColor: "#1E293B",
          borderRadius: 16,
          padding: 16,
          marginBottom: 20,
          borderLeftWidth: 4,
          borderLeftColor: "#8B5CF6",
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
          👥 Plan Together
        </Text>
        <Text style={{ color: "#94A3B8", fontSize: 13, lineHeight: 20 }}>
          Invite friends and family to plan this trip together. Everyone can add
          to the itinerary, packing list, and documents.
        </Text>
      </View>

      {/* Trip Owner */}
      {owner && (
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: "#64748B",
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Trip Creator
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#1E293B",
              padding: 14,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: "#F59E0B30",
            }}
          >
            {owner.profile_image ? (
              <Image
                source={{ uri: owner.profile_image }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  marginRight: 12,
                }}
              />
            ) : (
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: "#F59E0B20",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <Crown size={20} color="#F59E0B" />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
                {owner.username || "Trip Owner"}
              </Text>
              <Text
                style={{ color: "#F59E0B", fontSize: 12, fontWeight: "600" }}
              >
                👑 Organizer
              </Text>
            </View>
            {user && user.id === owner.user_id && (
              <View
                style={{
                  backgroundColor: "#F59E0B20",
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{ color: "#F59E0B", fontSize: 11, fontWeight: "800" }}
                >
                  YOU
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Collaborators List */}
      <Text
        style={{
          fontSize: 14,
          fontWeight: "700",
          color: "#64748B",
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        Travel Buddies ({collaborators.length})
      </Text>

      {collaborators.length === 0 ? (
        <View
          style={{
            backgroundColor: "#1E293B",
            borderRadius: 16,
            padding: 32,
            alignItems: "center",
          }}
        >
          <Users size={48} color="#475569" />
          <Text
            style={{
              color: "#94A3B8",
              fontSize: 15,
              fontWeight: "600",
              marginTop: 12,
            }}
          >
            No travel buddies yet
          </Text>
          <Text
            style={{
              color: "#64748B",
              fontSize: 13,
              marginTop: 4,
              textAlign: "center",
            }}
          >
            Invite friends to plan this trip together!
          </Text>
        </View>
      ) : (
        collaborators.map((collab) => {
          const isPending = collab.status === "pending";
          const isDeclined = collab.status === "declined";
          const statusColor = isPending
            ? "#F59E0B"
            : isDeclined
              ? "#EF4444"
              : "#10B981";
          const statusLabel = isPending
            ? "Pending"
            : isDeclined
              ? "Declined"
              : "Joined";

          return (
            <View
              key={collab.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#1E293B",
                padding: 14,
                borderRadius: 12,
                marginBottom: 10,
              }}
            >
              {collab.profile_image ? (
                <Image
                  source={{ uri: collab.profile_image }}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    marginRight: 12,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: "#8B5CF620",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  <Text
                    style={{
                      color: "#8B5CF6",
                      fontWeight: "800",
                      fontSize: 18,
                    }}
                  >
                    {collab.username?.[0]?.toUpperCase() || "?"}
                  </Text>
                </View>
              )}

              <View style={{ flex: 1 }}>
                <Text
                  style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}
                >
                  {collab.username || collab.email || "Unknown"}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 4,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: statusColor + "20",
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 6,
                    }}
                  >
                    <Text
                      style={{
                        color: statusColor,
                        fontSize: 11,
                        fontWeight: "800",
                      }}
                    >
                      {statusLabel}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: "#64748B",
                      fontSize: 11,
                      marginLeft: 8,
                    }}
                  >
                    {collab.role === "editor" ? "Can edit" : "View only"}
                  </Text>
                </View>
              </View>

              {isOwner && (
                <TouchableOpacity
                  onPress={() => removeCollaborator(collab.id)}
                  style={{
                    padding: 8,
                    backgroundColor: "#EF444415",
                    borderRadius: 8,
                  }}
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
          );
        })
      )}
    </View>
  );
}
