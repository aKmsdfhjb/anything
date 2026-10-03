import { View, Text, TouchableOpacity } from "react-native";
import { Layers, Satellite, Map as MapIcon } from "lucide-react-native";

const MAP_TYPES = [
  { value: "standard", label: "Standard", icon: MapIcon },
  { value: "satellite", label: "Satellite", icon: Satellite },
  { value: "hybrid", label: "Hybrid", icon: Layers },
];

export default function WorldMapControls({ mapType, onMapTypeChange, bottom }) {
  return (
    <View
      style={{
        position: "absolute",
        bottom: bottom || 20,
        left: 20,
        backgroundColor: "#1E293B",
        borderRadius: 12,
        padding: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      }}
    >
      {MAP_TYPES.map((type) => {
        const Icon = type.icon;
        const isActive = mapType === type.value;
        return (
          <TouchableOpacity
            key={type.value}
            onPress={() => onMapTypeChange(type.value)}
            style={{
              backgroundColor: isActive ? "#3B82F6" : "transparent",
              padding: 10,
              borderRadius: 8,
              marginBottom: 4,
              alignItems: "center",
            }}
          >
            <Icon size={20} color={isActive ? "#fff" : "#94A3B8"} />
            <Text
              style={{
                color: isActive ? "#fff" : "#94A3B8",
                fontSize: 10,
                fontWeight: "700",
                marginTop: 4,
              }}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
