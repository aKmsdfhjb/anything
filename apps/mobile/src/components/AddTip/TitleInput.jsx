import { View, Text, TextInput } from "react-native";

export function TitleInput({ value, onChangeText }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: "#374151",
          marginBottom: 8,
        }}
      >
        Title
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Give your tip a catchy title..."
        style={{
          backgroundColor: "#fff",
          padding: 16,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#E5E7EB",
          fontSize: 16,
          color: "#111827",
        }}
      />
    </View>
  );
}
