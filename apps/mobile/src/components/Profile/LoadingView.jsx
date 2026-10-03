import { View, ActivityIndicator } from "react-native";

export function LoadingView() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F3F4F6",
      }}
    >
      <ActivityIndicator
        size="large"
        color="#3B82F6"
        testID="activity-indicator"
      />
    </View>
  );
}
