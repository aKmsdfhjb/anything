import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  MessageCircle,
  Send,
  ArrowLeft,
  BadgeCheck,
} from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import useUser from "@/utils/auth/useUser";
import { useAuth } from "@/utils/auth/useAuth";

export default function MessagesPage() {
  const insets = useSafeAreaInsets();
  const { data: user } = useUser();
  const { auth, signIn } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      // Poll for new messages every 3 seconds
      const interval = setInterval(() => {
        fetchMessages(selectedConversation.id);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/messages");
      if (!response.ok) throw new Error("Failed to fetch conversations");
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await fetch(
        `/api/messages?conversation_id=${conversationId}`,
      );
      if (!response.ok) throw new Error("Failed to fetch messages");
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiver_id: selectedConversation.other_user_id,
          content: messageText.trim(),
          conversation_id: selectedConversation.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      setMessageText("");
      fetchMessages(selectedConversation.id);
      fetchConversations(); // Update last message in list
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Oops!", "Could not send message. Try again! 💬");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (!auth) {
    return (
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <StatusBar style="dark" />
        <View
          style={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 20,
            paddingBottom: 16,
            backgroundColor: "#6366F1",
          }}
        >
          <Text style={{ fontSize: 28, fontWeight: "bold", color: "#fff" }}>
            Messages 💬
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <MessageCircle size={64} color="#D1D5DB" />
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#1F2937",
              marginTop: 16,
              textAlign: "center",
            }}
          >
            Sign in to connect with travelers! 🌍
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#6B7280",
              marginTop: 8,
              textAlign: "center",
            }}
          >
            Chat, ask questions, and make travel buddies
          </Text>
          <TouchableOpacity
            onPress={signIn}
            style={{
              backgroundColor: "#6366F1",
              paddingHorizontal: 32,
              paddingVertical: 16,
              borderRadius: 12,
              marginTop: 24,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
              Let's Go! 🚀
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  // Chat view
  if (selectedConversation) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
        <StatusBar style="light" />

        {/* Chat Header */}
        <View
          style={{
            paddingTop: insets.top + 8,
            paddingHorizontal: 16,
            paddingBottom: 12,
            backgroundColor: "#6366F1",
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <TouchableOpacity onPress={() => setSelectedConversation(null)}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>

          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#fff",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {selectedConversation.other_profile_image ? (
              <Image
                source={{ uri: selectedConversation.other_profile_image }}
                style={{ width: 40, height: 40, borderRadius: 20 }}
              />
            ) : (
              <Text
                style={{ fontSize: 18, fontWeight: "bold", color: "#6366F1" }}
              >
                {selectedConversation.other_username?.[0]?.toUpperCase()}
              </Text>
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#fff" }}>
              {selectedConversation.other_username}
            </Text>
            <Text style={{ fontSize: 12, color: "#E0E7FF" }}>
              Travel buddy 🌍
            </Text>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => {
            const isMe = msg.sender_id === user.id;
            return (
              <View
                key={msg.id}
                style={{
                  alignSelf: isMe ? "flex-end" : "flex-start",
                  maxWidth: "75%",
                  marginBottom: 12,
                }}
              >
                {!isMe && (
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#6B7280",
                      marginBottom: 4,
                      marginLeft: 4,
                    }}
                  >
                    {msg.sender_username}
                  </Text>
                )}
                <View
                  style={{
                    backgroundColor: isMe ? "#6366F1" : "#fff",
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 16,
                    borderBottomRightRadius: isMe ? 4 : 16,
                    borderBottomLeftRadius: isMe ? 16 : 4,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      color: isMe ? "#fff" : "#1F2937",
                      lineHeight: 20,
                    }}
                  >
                    {msg.content}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 10,
                    color: "#9CA3AF",
                    marginTop: 4,
                    marginLeft: isMe ? 0 : 4,
                    marginRight: isMe ? 4 : 0,
                    textAlign: isMe ? "right" : "left",
                  }}
                >
                  {formatTime(msg.created_at)}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Message Input */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: insets.bottom + 12,
            backgroundColor: "#fff",
            borderTopWidth: 1,
            borderTopColor: "#E5E7EB",
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <TextInput
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type your message..."
            style={{
              flex: 1,
              backgroundColor: "#F3F4F6",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 24,
              fontSize: 15,
              color: "#1F2937",
            }}
            multiline
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!messageText.trim() || sending}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: messageText.trim() ? "#6366F1" : "#D1D5DB",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Send size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Conversations list
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar style="dark" />

      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#1F2937" }}>
          Messages 💬
        </Text>
        <Text style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>
          Connect with travelers worldwide
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {conversations.length === 0 ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <MessageCircle size={64} color="#D1D5DB" />
            <Text
              style={{
                fontSize: 16,
                color: "#9CA3AF",
                marginTop: 16,
                textAlign: "center",
              }}
            >
              No conversations yet
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#D1D5DB",
                marginTop: 8,
                textAlign: "center",
              }}
            >
              Follow travelers and start chatting! 🌍
            </Text>
          </View>
        ) : (
          conversations.map((conv) => (
            <TouchableOpacity
              key={conv.id}
              onPress={() => setSelectedConversation(conv)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#F3F4F6",
                backgroundColor: conv.unread_count > 0 ? "#EEF2FF" : "#fff",
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: "#6366F1",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                {conv.other_profile_image ? (
                  <Image
                    source={{ uri: conv.other_profile_image }}
                    style={{ width: 56, height: 56, borderRadius: 28 }}
                  />
                ) : (
                  <Text
                    style={{ fontSize: 24, fontWeight: "bold", color: "#fff" }}
                  >
                    {conv.other_username?.[0]?.toUpperCase()}
                  </Text>
                )}
                {conv.unread_count > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      backgroundColor: "#EF4444",
                      borderRadius: 10,
                      minWidth: 20,
                      height: 20,
                      justifyContent: "center",
                      alignItems: "center",
                      paddingHorizontal: 6,
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: "bold",
                      }}
                    >
                      {conv.unread_count}
                    </Text>
                  </View>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: conv.unread_count > 0 ? "bold" : "600",
                    color: "#1F2937",
                    marginBottom: 4,
                  }}
                >
                  {conv.other_username}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: conv.unread_count > 0 ? "#4B5563" : "#9CA3AF",
                    fontWeight: conv.unread_count > 0 ? "500" : "400",
                  }}
                  numberOfLines={1}
                >
                  {conv.last_message || "Start a conversation!"}
                </Text>
              </View>

              <Text style={{ fontSize: 12, color: "#9CA3AF" }}>
                {formatTime(conv.last_message_at)}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
