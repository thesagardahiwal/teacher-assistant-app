import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Platform, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import AttendanceCard from "../../components/Student/AttendanceCard";
import { academicYearService } from "../../services/academicYear.service";
import { attendanceRecordService } from "../../services/attendanceRecord.service";
import { useAuth } from "../../store/hooks/useAuth";
import { useTheme } from "../../store/hooks/useTheme";
import { AttendanceRecord } from "../../types";

// Helper component for Stat Cards
const StatCard = ({ label, value, colorClass, textColorClass, icon, delay = 0 }: any) => {
  const { isDark } = useTheme();
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      className={`flex-1 p-4 rounded-3xl mx-1 shadow-sm border ${colorClass} ${isDark ? "border-transparent" : ""}`}
    >
      <View className="flex-row justify-between items-start">
        <Text className={`text-3xl font-bold ${textColorClass} mb-1`}>{value}</Text>
        {icon && <Ionicons name={icon} size={20} color={isDark ? "#FFF" : "#000"} style={{ opacity: 0.5 }} />}
      </View>
      <Text className={`text-xs font-semibold uppercase tracking-wider ${textColorClass} opacity-70`}>{label}</Text>
    </Animated.View>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState({ present: 0, absent: 0, total: 0, percentage: 0 });

  const fetchAttendance = async () => {
    try {
      if (!user?.$id) return;

      const institutionId = typeof user.institution === 'string' ? user.institution : user.institution.$id;

      // Fetch Academic Years to find current
      const yearsRes = await academicYearService.list(institutionId);
      const currentYear = yearsRes.documents.find(y => y.isCurrent);

      const res = await attendanceRecordService.listByStudent(user.$id);

      // Filter by Current Academic Year
      const allRecords = res.documents.filter(r => {
        if (!currentYear) return true; // Fallback if no current year set (or partial setup)
        const rYear = r.attendance?.class?.academicYear;
        const rYearId = typeof rYear === 'string' ? rYear : rYear?.$id;
        return rYearId === currentYear.$id;
      });

      const presentCount = allRecords.filter(r => r.present).length;
      const totalCount = allRecords.length;
      const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

      setRecords(allRecords);
      setStats({
        present: presentCount,
        absent: totalCount - presentCount,
        total: totalCount,
        percentage
      });
    } catch (error) {
      console.error("Failed to fetch student attendance", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [user?.$id]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAttendance();
  }, []);

  return (
    <View className={`flex-1 ${isDark ? "bg-dark-background" : "bg-background"}`}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
        className="w-full px-6 pt-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()} className="mb-8 flex-row justify-between items-center">
          <View>
            <Text className={`text-lg font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Welcome back,
            </Text>
            <Text className={`text-3xl font-bold mt-1 ${isDark ? "text-white" : "text-gray-900"}`}>
              {user?.name?.split(' ')[0]}
            </Text>
            <Text className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Student • {user?.institution?.name || "Institution"}
            </Text>
          </View>
          <Link href="/(student)/profile" asChild>
            <TouchableOpacity className={`p-1 rounded-full border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow-sm"}`}>
              <View className="w-12 h-12 bg-blue-600 rounded-full items-center justify-center">
                <Text className="text-white font-bold text-xl">{user?.name?.charAt(0) || "U"}</Text>
              </View>
            </TouchableOpacity>
          </Link>
        </Animated.View>

        {/* Attendance Summary Card */}
        <Animated.View entering={FadeInDown.delay(200).springify()} className="bg-blue-600 rounded-[32px] p-6 shadow-xl shadow-blue-500/30 mb-8 overflow-hidden relative">
          {/* Background decoration */}
          <View className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500 rounded-full opacity-50" />
          <View className="absolute -left-10 -bottom-10 w-32 h-32 bg-blue-400 rounded-full opacity-30" />

          <Text className="text-blue-100 text-sm font-semibold uppercase tracking-wider mb-2">Attendance Score</Text>
          <View className="flex-row items-end mb-4">
            <Text className="text-6xl font-black text-white">{stats.percentage}</Text>
            <Text className="text-2xl font-bold text-white mb-3">%</Text>
          </View>

          <View className="flex-row items-center justify-between mt-2">
            <View className="flex-row gap-2">
              <View className="bg-blue-500/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <Text className="text-white text-xs font-medium">Present: {stats.present}</Text>
              </View>
              <View className="bg-blue-500/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <Text className="text-blue-100 text-xs font-medium">Total: {stats.total}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Quick Stats Grid */}
        <View className="flex-row gap-4 mb-8">
          <StatCard
            label="Attended"
            value={stats.present}
            colorClass={isDark ? "bg-gray-800" : "bg-white border-gray-100"}
            textColorClass="text-green-500"
            icon="checkmark-circle"
            delay={300}
          />
          <StatCard
            label="Missed"
            value={stats.absent}
            colorClass={isDark ? "bg-gray-800" : "bg-white border-gray-100"}
            textColorClass="text-red-500"
            icon="close-circle"
            delay={400}
          />
          <StatCard
            label="Total Sessions"
            value={stats.total}
            colorClass={isDark ? "bg-gray-800" : "bg-white border-gray-100"}
            textColorClass={isDark ? "text-gray-200" : "text-gray-700"}
            icon="list"
            delay={500}
          />
        </View>

        {/* Quick Links Flattened Grid */}
        <Text className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Quick Actions</Text>
        <View className="flex-row flex-wrap gap-4 mb-8">
          {[
            { href: "/(student)/assessments", icon: "school", label: "My Results", sub: "Check grades", color: "bg-indigo-500", delay: 600 },
            { href: "/(student)/calendar", icon: "calendar", label: "Calendar", sub: "Schedules", color: "bg-purple-500", delay: 700 },
            { href: "/(student)/study-vault", icon: "library", label: "Study Vault", sub: "Materials", color: "bg-amber-500", delay: 800 },
            { href: "/(student)/teachers", icon: "people", label: "Teachers", sub: "Faculty info", color: "bg-teal-500", delay: 900 },
          ].map((item, index) => {
            if (item.label.includes("Study Vault") && Platform.OS === "web") return null;
            return (
              <Animated.View key={index} entering={FadeInDown.delay(item.delay).springify()} className="w-[47%]">
                <Link href={item.href as any} asChild>
                  <TouchableOpacity className={`p-4 rounded-3xl ${isDark ? "bg-gray-800" : "bg-white shadow-sm border border-gray-100"}`}>
                    <View className={`w-12 h-12 rounded-2xl ${item.color} items-center justify-center mb-3 shadow-sm`}>
                      <Ionicons name={item.icon as any} size={24} color="white" />
                    </View>
                    <Text className={`font-bold text-base mb-0.5 ${isDark ? "text-white" : "text-gray-900"}`}>{item.label}</Text>
                    <Text className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>{item.sub}</Text>
                  </TouchableOpacity>
                </Link>
              </Animated.View>
            )
          })}
        </View>

        {/* Recent Activity Header */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            Recent Activity
          </Text>
          <Link href="/(student)/attendance" className="text-blue-600 font-semibold text-sm">
            View All
          </Link>
        </View>

        {/* Recent List */}
        {
          loading && !refreshing ? (
            <ActivityIndicator size="large" color="#2563EB" className="mt-8" />
          ) : records.length > 0 ? (
            records.slice(0, 5).map((record, index) => (
              <Animated.View key={record.$id} entering={FadeInDown.delay(1000 + (index * 100)).duration(400)}>
                <AttendanceCard record={record} />
              </Animated.View>
            ))
          ) : (
            <View className={`items-center py-12 rounded-3xl ${isDark ? "bg-gray-800" : "bg-gray-50 border border-gray-100"}`}>
              <Ionicons name="bar-chart-outline" size={48} color={isDark ? "#4B5563" : "#D1D5DB"} />
              <Text className={`mt-4 text-base ${isDark ? "text-gray-500" : "text-gray-400"}`}>No recent activity</Text>
            </View>
          )
        }

      </ScrollView >
    </View>
  );
};

export default Dashboard;