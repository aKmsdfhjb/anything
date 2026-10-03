import { View, Text, TouchableOpacity, Alert } from "react-native";
import {
  FileText,
  Plane,
  Hotel,
  Ticket,
  Car,
  Shield,
  FileCheck,
  Trash2,
  Download,
  CheckCircle,
  Bell,
} from "lucide-react-native";
import { useState, useEffect } from "react";
import * as FileSystem from "expo-file-system";
import useFlightReminders from "@/hooks/useFlightReminders";

const DOCUMENT_ICONS = {
  flight: Plane,
  hotel: Hotel,
  event: Ticket,
  rental: Car,
  insurance: Shield,
  visa: FileCheck,
  other: FileText,
};

const DOCUMENT_COLORS = {
  flight: "#3B82F6",
  hotel: "#10B981",
  event: "#8B5CF6",
  rental: "#F59E0B",
  insurance: "#EF4444",
  visa: "#06B6D4",
  other: "#6B7280",
};

export default function DocumentCard({ document, onDelete, onView }) {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { scheduleFlightReminder } = useFlightReminders();

  const Icon = DOCUMENT_ICONS[document.document_type] || FileText;
  const color = DOCUMENT_COLORS[document.document_type] || "#6B7280";

  const getFileExtension = (url) => {
    const extension = url.split(".").pop().toLowerCase();
    return extension;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const downloadForOffline = async () => {
    try {
      setDownloading(true);
      const fileUri =
        FileSystem.documentDirectory +
        `trip_doc_${document.id}.${getFileExtension(document.file_url)}`;

      const downloadResumable = FileSystem.createDownloadResumable(
        document.file_url,
        fileUri,
      );

      const result = await downloadResumable.downloadAsync();

      if (result && result.uri) {
        setIsDownloaded(true);
        Alert.alert("Downloaded!", "Document is now available offline");
      }
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert(
        "Download Failed",
        "Could not download document for offline access",
      );
    } finally {
      setDownloading(false);
    }
  };

  const checkIfDownloaded = async () => {
    const fileUri =
      FileSystem.documentDirectory +
      `trip_doc_${document.id}.${getFileExtension(document.file_url)}`;
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    setIsDownloaded(fileInfo.exists);
  };

  const setFlightReminder = () => {
    if (document.document_type !== "flight") return;

    Alert.prompt(
      "Flight Time",
      "Enter your flight date and time (YYYY-MM-DD HH:MM)",
      async (dateTimeStr) => {
        if (!dateTimeStr) return;

        try {
          const flightTime = new Date(dateTimeStr);
          if (isNaN(flightTime.getTime())) {
            Alert.alert(
              "Invalid Date",
              "Please use format: YYYY-MM-DD HH:MM\nExample: 2026-06-15 14:30",
            );
            return;
          }

          await scheduleFlightReminder(document, flightTime.toISOString());
        } catch (error) {
          console.error("Error setting reminder:", error);
          Alert.alert("Error", "Could not set flight reminder");
        }
      },
      "plain-text",
      "",
      "default",
    );
  };

  useEffect(() => {
    checkIfDownloaded();
  }, []);

  return (
    <View
      style={{
        backgroundColor: "#1E293B",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: color,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
        {/* Icon */}
        <View
          style={{
            backgroundColor: color + "20",
            padding: 12,
            borderRadius: 12,
          }}
        >
          <Icon size={24} color={color} />
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#fff",
                flex: 1,
              }}
            >
              {document.title}
            </Text>
            {isDownloaded && (
              <View
                style={{
                  backgroundColor: "#10B98120",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <CheckCircle size={12} color="#10B981" />
                <Text
                  style={{ color: "#10B981", fontSize: 10, fontWeight: "700" }}
                >
                  OFFLINE
                </Text>
              </View>
            )}
          </View>

          <Text
            style={{
              fontSize: 12,
              color: color,
              fontWeight: "600",
              marginBottom: 8,
              textTransform: "uppercase",
            }}
          >
            {document.document_type}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 12, color: "#94A3B8" }}>
              {getFileExtension(document.file_url).toUpperCase()}
            </Text>
            <View
              style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: "#475569",
              }}
            />
            <Text style={{ fontSize: 12, color: "#94A3B8" }}>
              {formatFileSize(document.file_size)}
            </Text>
          </View>

          {document.notes && (
            <Text
              style={{
                fontSize: 13,
                color: "#CBD5E1",
                fontStyle: "italic",
                marginBottom: 12,
              }}
              numberOfLines={2}
            >
              {document.notes}
            </Text>
          )}

          {/* Actions */}
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <TouchableOpacity
              onPress={onView}
              style={{
                flex: 1,
                minWidth: 80,
                backgroundColor: color,
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
                View
              </Text>
            </TouchableOpacity>

            {document.document_type === "flight" && (
              <TouchableOpacity
                onPress={setFlightReminder}
                style={{
                  backgroundColor: "#8B5CF6",
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 10,
                  alignItems: "center",
                  flexDirection: "row",
                  gap: 6,
                }}
              >
                <Bell size={16} color="#fff" />
                <Text
                  style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}
                >
                  Remind
                </Text>
              </TouchableOpacity>
            )}

            {!isDownloaded && (
              <TouchableOpacity
                onPress={downloadForOffline}
                disabled={downloading}
                style={{
                  backgroundColor: "#10B981",
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                  alignItems: "center",
                  opacity: downloading ? 0.5 : 1,
                }}
              >
                <Download size={20} color="#fff" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={onDelete}
              style={{
                backgroundColor: "#EF444420",
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Trash2 size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
