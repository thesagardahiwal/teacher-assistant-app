import { ModernTabBar } from "@/components/ui/ModernTabBar";
import { ResponsiveSidebar } from "@/components/ui/ResponsiveSidebar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, Text, View } from "react-native";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import { useTheme } from "../../store/hooks/useTheme";

export default function AdminLayout() {
  const { isDark } = useTheme();

  const sidebarItems = [
    { label: "Dashboard", icon: "view-dashboard", route: "/(admin)/dashboard" },
    { label: "Teachers", icon: "account-tie", route: "/(admin)/teachers" },
    { label: "Students", icon: "school-outline", iconLibrary: "Ionicons", route: "/(admin)/students" },
    { label: "Classes", icon: "google-classroom", route: "/(admin)/classes" },
    { label: "Courses", icon: "book-open-page-variant", route: "/(admin)/courses" },
    { label: "Subjects", icon: "book-outline", iconLibrary: "Ionicons", route: "/(admin)/subjects" },
    { label: "Academic Years", icon: "calendar-check", route: "/(admin)/academic-years" },
    { label: "Schedules", icon: "calendar-clock", route: "/(admin)/schedules" },
  ];

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <View className="flex-1 flex-row">
        {Platform.OS === "web" && (
          <ResponsiveSidebar
            items={sidebarItems as any}
            header={
              <View className="flex-row items-center gap-2 mb-2">
                <MaterialCommunityIcons name="security" size={32} color="#2563EB" />
                <View>
                  <View className="flex-row">
                    <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Teach</Text>
                    <Text className="text-xl font-bold text-blue-600">ora</Text>
                  </View>
                  <Text className="text-[10px] text-gray-500 uppercase tracking-widest">Administrator</Text>
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
                  <MaterialCommunityIcons name="account-tie" size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="students/index"
              options={{
                title: "Students",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="school-outline" size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="classes/index"
              options={{
                title: "Classes",
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="google-classroom" size={size} color={color} />
                ),
              }}
            />

            {/* Hidden tabs / Less frequent ones (Only first 4-5 show on mobile bottom bar usually due to space) */}

            <Tabs.Screen
              name="courses/index"
              options={{
                title: "Courses",
                href: null, // Hide from bottom bar on mobile to save space, but show in sidebar? sidebarItems handles Sidebar. This hides from mobile bottom tab.
                // Actually, if we want them reachable on mobile, we need them in "More" or valid tabs. For now, let's keep them as valid tabs but maybe they will crowd the bar. 
                // I will set href: null for things that don't fit well, OR just let them squash. 
                // The user said "sidebar for web". Mobile behavior wasn't specified but typically 5 tabs max.
                // Let's hide less common ones from mobile bottom bar but ensure reachable via specific links in dashboard.
                // Wait, if href is null, can we navigate to it? Yes, programmatically.
                // But Sidebar uses router.push. If it's a Tab, router.push works.
                // IF href is null, it acts as a non-tab route within the navigator? No, usually it hides the button.
                // Let's keep them hidden from bottom bar (href: null) but accessible via Dashboard Quick Actions on Mobile.
                // For Sidebar (Web), we iterate `sidebarItems` and `router.push('/(admin)/courses')`. This should work even if href is null in Tabs config?
                // Actually, if href is null, it might not mount as a tab. It just mounts as a screen in the navigator.
                // So correct.
              }}
            />
            <Tabs.Screen name="subjects/index" options={{ href: null }} />
            <Tabs.Screen name="academic-years/index" options={{ href: null }} />
            <Tabs.Screen name="schedules/index" options={{ href: null }} />
            <Tabs.Screen name="assignments/index" options={{ href: null }} />

            <Tabs.Screen name="profile" options={{ href: null }} />

            {/* Sub-screens */}
            {/* Hidden Create Screens */}
            <Tabs.Screen name="teachers/create" options={{ href: null }} />
            <Tabs.Screen name="students/create" options={{ href: null }} />
            <Tabs.Screen name="classes/create" options={{ href: null }} />
            <Tabs.Screen name="courses/create" options={{ href: null }} />
            <Tabs.Screen name="subjects/create" options={{ href: null }} />
            <Tabs.Screen name="academic-years/create" options={{ href: null }} />
            <Tabs.Screen name="schedules/create" options={{ href: null }} />
            <Tabs.Screen name="assignments/create" options={{ href: null }} />
            <Tabs.Screen name="promotion/create" options={{ href: null }} />

            {/* Hidden Detail Screens */}
            <Tabs.Screen name="teachers/[id]" options={{ href: null }} />
            <Tabs.Screen name="students/[id]" options={{ href: null }} />
            <Tabs.Screen name="classes/[id]" options={{ href: null }} />
            <Tabs.Screen name="courses/[id]" options={{ href: null }} />
            <Tabs.Screen name="subjects/[id]" options={{ href: null }} />
            <Tabs.Screen name="academic-years/[id]" options={{ href: null }} />
            <Tabs.Screen name="schedules/[id]" options={{ href: null }} />
            <Tabs.Screen name="assignments/[id]" options={{ href: null }} />

          </Tabs>
        </View>
      </View>
    </ProtectedRoute>
  );
}
