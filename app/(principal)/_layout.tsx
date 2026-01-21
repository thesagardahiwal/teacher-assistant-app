import { Sidebar } from "@/components/ui/Sidebar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import { useAuthGuard } from "../../hooks/useAuthGuard";
import { useTheme } from "../../store/hooks/useTheme";

export default function PrincipalLayout() {
  const { isAuthorized, isLoading } = useAuthGuard(["PRINCIPAL", "VICE_PRINCIPAL"]);
  const { isDark } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthorized) return null;

  const sidebarItems = [
    { label: "Dashboard", icon: "view-dashboard", route: "/(principal)/dashboard" },
    { label: "Teachers", icon: "school", iconLibrary: "Ionicons", route: "/(principal)/teachers" },
    { label: "Students", icon: "people", iconLibrary: "Ionicons", route: "/(principal)/students" },
    { label: "Classes", icon: "calendar-clock", route: "/(principal)/classes" },
  ];

  return (
    <View className="flex-1 flex-row">
      {Platform.OS === "web" && (
        <Sidebar
          items={sidebarItems as any}
          header={
            <View className="flex-row items-center gap-2 mb-2">
              <MaterialCommunityIcons name="security" size={32} color="#2563EB" />
              <View>
                <View className="flex-row">
                  <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Teach</Text>
                  <Text className="text-xl font-bold text-blue-600">ora</Text>
                </View>
                <Text className="text-[10px] text-gray-500 uppercase tracking-widest">Principal</Text>
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
                <Ionicons name="school" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="students/index"
            options={{
              title: "Students",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="people" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="classes/index"
            options={{
              title: "Classes",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="calendar-clock" size={size} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="principal-profile"
            options={{
              href: null,
            }}
          />

          <Tabs.Screen
            name="overview"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="classes/[id]"
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
            name="teachers/[id]"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="courses/index"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="assignments/create"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="calendar"
            options={{
              title: "Calendar",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="calendar-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="study-vault/index"
            options={{
              title: "Vault",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="folder-open-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="attendance"
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
            name="assessments"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="users"
            options={{
              href: null,
            }}
          />
        </Tabs>
      </View>
    </View>
  );
}
