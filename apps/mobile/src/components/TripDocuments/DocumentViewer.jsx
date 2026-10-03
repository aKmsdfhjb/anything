import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { X } from "lucide-react-native";
import { Image } from "expo-image";
import { useState } from "react";
import { WebView } from "react-native-webview";
import * as FileSystem from "expo-file-system";

export default function DocumentViewer({ visible, document, onClose }) {
  const [loading, setLoading] = useState(true);
  const { width, height } = Dimensions.get("window");

  if (!document) return null;

  const isImage = document.file_type.startsWith("image/");
  const isPDF =
    document.file_type === "application/pdf" ||
    document.file_url.toLowerCase().endsWith(".pdf");

  const getOfflineUri = () => {
    const extension = document.file_url.split(".").pop().toLowerCase();
    return (
      FileSystem.documentDirectory + `trip_doc_${document.id}.${extension}`
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        {/* Header */}
        <View
          style={{
            padding: 20,
            paddingTop: 60,
            backgroundColor: "#1E293B",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1, marginRight: 16 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#fff",
                marginBottom: 4,
              }}
              numberOfLines={1}
            >
              {document.title}
            </Text>
            <Text style={{ fontSize: 14, color: "#94A3B8" }}>
              {document.document_type.toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: "#334155",
              padding: 10,
              borderRadius: 12,
            }}
          >
            <X size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Document Content */}
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          {loading && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: "center",
                alignItems: "center",
                zIndex: 10,
              }}
            >
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={{ color: "#94A3B8", marginTop: 16, fontSize: 16 }}>
                Loading document...
              </Text>
            </View>
          )}

          {isImage ? (
            <ScrollView
              maximumZoomScale={3}
              minimumZoomScale={1}
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={{ uri: document.file_url }}
                style={{ width, height: height - 120 }}
                contentFit="contain"
                onLoadEnd={() => setLoading(false)}
                transition={200}
              />
            </ScrollView>
          ) : isPDF ? (
            <WebView
              source={{ uri: document.file_url }}
              style={{ flex: 1, backgroundColor: "#000" }}
              onLoadEnd={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                alert(
                  "Could not load PDF. Try downloading for offline access.",
                );
              }}
            />
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 40,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  color: "#94A3B8",
                  textAlign: "center",
                  marginBottom: 20,
                }}
              >
                Preview not available for this file type
              </Text>
              <Text
                style={{ fontSize: 14, color: "#64748B", textAlign: "center" }}
              >
                File type: {document.file_type}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
