import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuthGuard } from "../../hooks/useAuthGuard";
import { useTheme } from "../../store/hooks/useTheme";

export default function TeacherLayout() {
  const { isAuthorized, isLoading } = useAuthGuard(["TEACHER"]);
  const { isDark } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthorized) return null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? "#111827" : "#FFFFFF",
          borderTopColor: isDark ? "#1F2937" : "#E5E7EB",
          height: 60,
          paddingTop: 5,
        },
        tabBarActiveTintColor: "#2563EB", // primary color
        tabBarInactiveTintColor: "#9CA3AF", // muted text
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="classes"
        options={{
          title: "Classes",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-clock" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="students"
        options={{
          title: "Students",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: "Attendance",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clipboard-check" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="schedule"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
