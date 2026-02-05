import { ModernTabBar } from "@/components/ui/ModernTabBar";
import { ResponsiveSidebar } from "@/components/ui/ResponsiveSidebar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, Text, View } from "react-native";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import { useTheme } from "../../store/hooks/useTheme";

export default function StudentLayout() {
  const { isDark } = useTheme();

  const sidebarItems = [
    { label: "Dashboard", icon: "view-dashboard", route: "/(student)/dashboard" },
    { label: "Teachers", icon: "school-outline", iconLibrary: "Ionicons", route: "/(student)/teachers" },
    { label: "Calendar", icon: "calendar", iconLibrary: "Ionicons", route: "/(student)/calendar" },
    { label: "Results", icon: "clipboard-text", route: "/(student)/assessments" },
    { label: "Attendance", icon: "clipboard-check", route: "/(student)/attendance" },
  ];

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <View className="flex-1 bg-background dark:bg-dark-background flex-row">
        {Platform.OS === "web" && (
          <ResponsiveSidebar
            items={sidebarItems as any}
            header={
              <View className="flex-row items-center gap-2 mb-2">
                <MaterialCommunityIcons name="school" size={32} color="#2563EB" />
                <View>
                  <View className="flex-row">
                    <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Teach</Text>
                    <Text className="text-xl font-bold text-blue-600">ora</Text>
                  </View>
                  <Text className="text-[10px] text-gray-500 uppercase tracking-widest">Student</Text>
                </View>
              </View>
            }
          />
        )}
        <View className="flex-1">
          <Tabs
            tabBar={Platform.OS === "web" ? undefined : (props) => <ModernTabBar {...props} />}
            screenOptions={{
              headerShown: false,
              tabBarStyle: Platform.OS === "web" ? { display: "none" } : undefined,
            }}
          >
            <Tabs.Screen
              name="dashboard"
              options={{
                title: "Dashboard",
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="teachers/index"
              options={{
                title: "Teachers",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="people" size={size} color={color} />
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
              name="assessments"
              options={{
                title: "Results",
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="clipboard-text" size={size} color={color} />
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

            {/* Hidden tabs */}
            <Tabs.Screen name="profile" options={{ href: null }} />
            <Tabs.Screen name="study-vault/index" options={{ href: null }} />
            <Tabs.Screen name="teachers/[id]" options={{ href: null }} />
          </Tabs>
        </View>
      </View>
    </ProtectedRoute>
  );
}
