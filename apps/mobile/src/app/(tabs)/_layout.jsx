import { Tabs } from "expo-router";
import { Platform } from "react-native";
import {
  Compass,
  Sparkles,
  Map,
  Briefcase,
  UserCircle,
} from "lucide-react-native";

function TabIcon({ Icon, color, focused }) {
  return (
    <Icon
      color={color}
      size={focused ? 25 : 23}
      strokeWidth={focused ? 2.2 : 1.8}
    />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0.5,
          borderTopColor: "rgba(0,0,0,0.08)",
          paddingTop: 10,
          paddingBottom: Platform.OS === "ios" ? 26 : 14,
          // height intentionally omitted — auto-computed for iOS compliance
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.06,
          shadowRadius: 16,
          elevation: 20,
        },
        tabBarActiveTintColor: "#008C8F",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: 3,
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Compass} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: "Feed",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Sparkles} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: "Trips",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Briefcase} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore-map"
        options={{
          title: "Map",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Map} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={UserCircle} color={color} focused={focused} />
          ),
        }}
      />

      {/* Hidden screens — reachable by router.push but not shown in tab bar */}
      <Tabs.Screen name="add-tip" options={{ href: null }} />
      <Tabs.Screen name="wallet" options={{ href: null }} />
      <Tabs.Screen name="saved" options={{ href: null }} />
      <Tabs.Screen name="messages" options={{ href: null }} />
      <Tabs.Screen name="plan-trip" options={{ href: null }} />
      <Tabs.Screen name="trip-details" options={{ href: null }} />
      <Tabs.Screen name="destination" options={{ href: null }} />
      <Tabs.Screen name="tip-details" options={{ href: null }} />
    </Tabs>
  );
}
