import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, ImagePlus, Sparkles, X } from "lucide-react-native";
import { Image } from "expo-image";

export function PhotoGrid({
  photoAssets,
  maxPhotos,
  onAddPhoto,
  onRemovePhoto,
}) {
  return (
    <View style={{ marginBottom: 20 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Sparkles size={18} color="#FF006E" />
          <Text
            style={{
              fontSize: 16,
              fontWeight: "800",
              color: "#0F172A",
            }}
          >
            Add Photos
          </Text>
        </View>
        <View
          style={{
            backgroundColor: "#F1F5F9",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 8,
          }}
        >
          <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "700" }}>
            {photoAssets.length}/{maxPhotos}
          </Text>
        </View>
      </View>

      <Text
        style={{
          fontSize: 13,
          color: "#64748B",
          marginBottom: 12,
          lineHeight: 18,
        }}
      >
        Showcase the beauty! Add up to {maxPhotos} stunning photos 📸
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {photoAssets.map((photo, index) => (
          <View
            key={index}
            style={{
              width: "48%",
              aspectRatio: 1,
              borderRadius: 16,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Image
              source={{ uri: photo.uri }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              transition={200}
            />

            <View
              style={{
                position: "absolute",
                top: 8,
                left: 8,
              }}
            >
              <LinearGradient
                colors={["#FF006E", "#EC4899"]}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: "#FFF",
                }}
              >
                <Text
                  style={{
                    color: "#FFF",
                    fontSize: 12,
                    fontWeight: "900",
                  }}
                >
                  {index + 1}
                </Text>
              </LinearGradient>
            </View>

            <TouchableOpacity
              onPress={() => onRemovePhoto(index)}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                backgroundColor: "rgba(0,0,0,0.7)",
                padding: 6,
                borderRadius: 12,
              }}
            >
              <X size={16} color="#fff" />
            </TouchableOpacity>

            {index === 0 && (
              <View
                style={{
                  position: "absolute",
                  bottom: 8,
                  left: 8,
                  right: 8,
                }}
              >
                <LinearGradient
                  colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      color: "#FF006E",
                      fontWeight: "800",
                      textAlign: "center",
                    }}
                  >
                    ⭐ COVER PHOTO
                  </Text>
                </LinearGradient>
              </View>
            )}
          </View>
        ))}

        {photoAssets.length < maxPhotos && (
          <>
            <TouchableOpacity
              onPress={() => onAddPhoto(true)}
              activeOpacity={0.8}
              style={{
                width: "48%",
                aspectRatio: 1,
              }}
            >
              <LinearGradient
                colors={["#FF006E", "#EC4899"]}
                style={{
                  flex: 1,
                  borderRadius: 16,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: "#FFF",
                  borderStyle: "dashed",
                }}
              >
                <Camera color="#fff" size={32} />
                <Text
                  style={{
                    marginTop: 8,
                    fontSize: 13,
                    color: "#fff",
                    fontWeight: "800",
                  }}
                >
                  Take Photo
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onAddPhoto(false)}
              activeOpacity={0.8}
              style={{
                width: "48%",
                aspectRatio: 1,
              }}
            >
              <LinearGradient
                colors={["#8B5CF6", "#7C3AED"]}
                style={{
                  flex: 1,
                  borderRadius: 16,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: "#FFF",
                  borderStyle: "dashed",
                }}
              >
                <ImagePlus color="#fff" size={32} />
                <Text
                  style={{
                    marginTop: 8,
                    fontSize: 13,
                    color: "#fff",
                    fontWeight: "800",
                  }}
                >
                  Choose Photo
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}
