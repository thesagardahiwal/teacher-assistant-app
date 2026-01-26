import { Sidebar } from "@/components/ui/Sidebar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, Text, View } from "react-native";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import { useAuth } from "../../store/hooks/useAuth";
import { useTheme } from "../../store/hooks/useTheme";

export default function TeacherLayout() {
  const { isDark } = useTheme();
  const { user } = useAuth();

  const sidebarItems = React.useMemo(() => {
    const items = [
      { label: "Dashboard", icon: "view-dashboard", iconLibrary: "MaterialCommunityIcons", route: "/(teacher)" },
    ];

    const isPrincipal = user?.role === "PRINCIPAL" || user?.role === "VICE_PRINCIPAL";

    if (isPrincipal) {
      items.push(
        { label: "Courses", icon: "book-open-variant", iconLibrary: "MaterialCommunityIcons", route: "/(teacher)/courses" },
        { label: "All Classes", icon: "calendar-clock", iconLibrary: "Ionicons", route: "/(teacher)/classes" },
        { label: "Teachers", icon: "school", iconLibrary: "Ionicons", route: "/(teacher)/teachers" },
        { label: "Students", icon: "people", iconLibrary: "Ionicons", route: "/(teacher)/students" },
      );
    } else {
      // Regular Teacher Items
      items.push(
        { label: "My Classes", icon: "calendar-clock", iconLibrary: "Ionicons", route: "/(teacher)/classes" },
        { label: "Students", icon: "people", iconLibrary: "Ionicons", route: "/(teacher)/students" },
      );
    }

    // Common Items
    items.push(
      { label: "Calendar", icon: "calendar", iconLibrary: "Ionicons", route: "/(teacher)/calendar" },
      { label: "Attendance", icon: "clipboard-check", iconLibrary: "MaterialCommunityIcons", route: "/(teacher)/attendance" },
    );

    return items;
  }, [user?.role]);

  return (
    <ProtectedRoute allowedRoles={["TEACHER", "PRINCIPAL", "VICE_PRINCIPAL"]}>
      <View className="flex-1 flex-row">
        {Platform.OS === "web" && (
          <Sidebar
            items={sidebarItems as any}
            header={
              <View className="flex-row items-center gap-2 mb-2">
                <MaterialCommunityIcons name="school" size={32} color="#2563EB" />
                <View>
                  <View className="flex-row">
                    <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Teach</Text>
                    <Text className="text-xl font-bold text-blue-600">ora</Text>
                  </View>
                  <Text className="text-[10px] text-gray-500 uppercase tracking-widest">Teacher</Text>
                </View>
              </View>
            }
          />
        )}
        <View className="flex-1">
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                backgroundColor: isDark ? "#111827" : "#FFFFFF",
                borderTopColor: isDark ? "#1F2937" : "#E5E7EB",
                height: 60,
                paddingTop: 5,
                display: Platform.OS === "web" ? "none" : "flex",
              },
              tabBarActiveTintColor: isDark ? "#60A5FA" : "#2563EB",
              tabBarInactiveTintColor: isDark ? "#9CA3AF" : "#6B7280",
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
              name="calendar"
              options={{
                title: "Calendar",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="calendar" size={size} color={color} />
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
                href: null,
              }}
            />

            <Tabs.Screen
              name="schedule"
              options={{
                href: null,
              }}
            />

            <Tabs.Screen
              name="study-vault/index"
              options={{
                href: null,
              }}
            />
            <Tabs.Screen
              name="assessments"
              options={{
                href: null,
              }}
            />
            <Tabs.Screen
              name="students/[id]"
              options={{
                href: null,
              }}
            />

            <Tabs.Screen
              name="teachers/index"
              options={{
                href: null,
              }}
            />

            <Tabs.Screen
              name="teachers/[id]"
              options={{
                href: null,
              }}
            />
          </Tabs>
        </View>
      </View>
    </ProtectedRoute>
  );
}
