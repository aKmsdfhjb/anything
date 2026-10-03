import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Shield,
  Download,
  Trash2,
  ChevronRight,
  CheckCircle,
  Circle,
} from "lucide-react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import useUser from "../utils/auth/useUser";

export default function PrivacySettings() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: user, loading: userLoading } = useUser();
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletionRequest, setDeletionRequest] = useState(null);

  useEffect(() => {
    if (user) {
      loadConsents();
      checkDeletionRequest();
    }
  }, [user]);

  const loadConsents = async () => {
    try {
      const response = await fetch("/api/gdpr/consent");
      if (!response.ok) throw new Error("Failed to load consents");
      const data = await response.json();
      setConsents(data.consents || []);
    } catch (err) {
      console.error("Error loading consents:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkDeletionRequest = async () => {
    try {
      const response = await fetch("/api/gdpr/delete");
      if (!response.ok) return;
      const data = await response.json();
      const pending = data.requests?.find(
        (r) => r.status === "pending" || r.status === "processing",
      );
      setDeletionRequest(pending);
    } catch (err) {
      console.error("Error checking deletion request:", err);
    }
  };

  const hasConsent = (type) => {
    return consents.some((c) => c.consent_type === type && !c.withdrawn_at);
  };

  const handleExportData = async () => {
    try {
      Alert.alert(
        "Export Your Data",
        "This will download all your personal data in JSON format.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Export",
            onPress: async () => {
              const response = await fetch("/api/gdpr/export");
              if (!response.ok) throw new Error("Export failed");
              const data = await response.json();

              Alert.alert(
                "Success",
                "Your data has been exported. Check your downloads folder.",
              );
            },
          },
        ],
      );
    } catch (err) {
      Alert.alert("Error", "Failed to export data. Please try again.");
      console.error("Export error:", err);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete all your data. This action cannot be undone. Your request will be processed within 30 days as per GDPR requirements.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch("/api/gdpr/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "full_deletion" }),
              });

              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error);
              }

              Alert.alert(
                "Request Submitted",
                "Your deletion request has been submitted. You will receive confirmation within 30 days.",
              );
              checkDeletionRequest();
            } catch (err) {
              Alert.alert(
                "Error",
                err.message || "Failed to submit deletion request",
              );
            }
          },
        },
      ],
    );
  };

  const toggleConsent = async (type, currentStatus) => {
    try {
      if (currentStatus) {
        // Withdraw consent
        const response = await fetch(`/api/gdpr/consent?consent_type=${type}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to withdraw consent");
      } else {
        // Give consent
        const response = await fetch("/api/gdpr/consent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ consent_type: type, consented: true }),
        });
        if (!response.ok) throw new Error("Failed to update consent");
      }

      loadConsents();
    } catch (err) {
      Alert.alert("Error", "Failed to update consent");
      console.error(err);
    }
  };

  if (userLoading || loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F9FAFB",
        }}
      >
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!user) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F9FAFB",
          padding: 20,
        }}
      >
        <Shield size={48} color="#9CA3AF" />
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: "#6B7280",
            marginTop: 16,
          }}
        >
          Please sign in to access privacy settings
        </Text>
      </View>
    );
  }

  const consentItems = [
    { type: "privacy_policy", label: "Privacy Policy", required: true },
    { type: "terms_of_service", label: "Terms of Service", required: true },
    { type: "data_processing", label: "Data Processing", required: true },
    { type: "marketing", label: "Marketing Communications", required: false },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingBottom: 16,
          paddingHorizontal: 20,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Shield size={32} color="#3B82F6" strokeWidth={2.5} />
          <View>
            <Text style={{ fontSize: 24, fontWeight: "800", color: "#0F172A" }}>
              Privacy & Data
            </Text>
            <Text style={{ fontSize: 14, color: "#64748B", marginTop: 2 }}>
              GDPR Compliant
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Deletion Request Warning */}
        {deletionRequest && (
          <View
            style={{
              margin: 20,
              padding: 16,
              backgroundColor: "#FEF2F2",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#FCA5A5",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#DC2626",
                marginBottom: 4,
              }}
            >
              Deletion Request Pending
            </Text>
            <Text style={{ fontSize: 14, color: "#991B1B" }}>
              Your account deletion request is being processed. This will be
              completed within 30 days.
            </Text>
          </View>
        )}

        {/* Consent Management */}
        <View
          style={{
            margin: 20,
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#E5E7EB",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#0F172A" }}>
              Consent Management
            </Text>
            <Text style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>
              Manage your data processing consents
            </Text>
          </View>

          {consentItems.map((item, index) => {
            const hasIt = hasConsent(item.type);
            return (
              <TouchableOpacity
                key={item.type}
                onPress={() =>
                  !item.required && toggleConsent(item.type, hasIt)
                }
                disabled={item.required}
                style={{
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottomWidth: index < consentItems.length - 1 ? 1 : 0,
                  borderBottomColor: "#F3F4F6",
                  opacity: item.required ? 0.6 : 1,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#1F2937",
                    }}
                  >
                    {item.label}
                  </Text>
                  {item.required && (
                    <Text
                      style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}
                    >
                      Required
                    </Text>
                  )}
                </View>
                {hasIt ? (
                  <CheckCircle size={24} color="#10B981" />
                ) : (
                  <Circle size={24} color="#D1D5DB" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* GDPR Rights */}
        <View style={{ margin: 20, marginTop: 0 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: "#0F172A",
              marginBottom: 12,
            }}
          >
            Your GDPR Rights
          </Text>

          {/* Export Data */}
          <TouchableOpacity
            onPress={handleExportData}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "#DBEAFE",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Download size={24} color="#3B82F6" />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text
                style={{ fontSize: 16, fontWeight: "700", color: "#0F172A" }}
              >
                Export My Data
              </Text>
              <Text style={{ fontSize: 14, color: "#64748B", marginTop: 2 }}>
                Download all your personal data
              </Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Delete Account */}
          {!deletionRequest && (
            <TouchableOpacity
              onPress={handleDeleteAccount}
              style={{
                backgroundColor: "#FEF2F2",
                borderRadius: 12,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#FCA5A5",
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#FEE2E2",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Trash2 size={24} color="#DC2626" />
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text
                  style={{ fontSize: 16, fontWeight: "700", color: "#DC2626" }}
                >
                  Delete My Account
                </Text>
                <Text style={{ fontSize: 14, color: "#991B1B", marginTop: 2 }}>
                  Permanently delete all data
                </Text>
              </View>
              <ChevronRight size={20} color="#DC2626" />
            </TouchableOpacity>
          )}
        </View>

        {/* Info */}
        <View
          style={{
            margin: 20,
            marginTop: 0,
            padding: 16,
            backgroundColor: "#F0F9FF",
            borderRadius: 12,
          }}
        >
          <Text style={{ fontSize: 14, color: "#075985", lineHeight: 20 }}>
            ℹ️ Your privacy matters. All data processing complies with GDPR
            regulations. You have the right to access, export, and delete your
            data at any time.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
