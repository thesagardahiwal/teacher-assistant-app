import { PageHeader } from "@/components/admin/ui/PageHeader";
import { academicYearService } from "@/services/academicYear.service";
import { useTheme } from "@/store/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import AttendanceCard from "../../components/Student/AttendanceCard";
import { attendanceRecordService } from "../../services/attendanceRecord.service";
import { useAuth } from "../../store/hooks/useAuth";
import { AttendanceRecord } from "../../types";

const StatBox = ({ label, value, color, icon, delay }: any) => {
  const { isDark } = useTheme();
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      className={`flex-1 p-4 rounded-2xl ${isDark ? "bg-gray-800" : "bg-white border border-gray-100 shadow-sm"}`}
    >
      <View className={`w-10 h-10 rounded-full ${color} items-center justify-center mb-2`}>
        <Ionicons name={icon} size={20} color="white" />
      </View>
      <Text className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{value}</Text>
      <Text className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{label}</Text>
    </Animated.View>
  )
}

const Attendance = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState({ present: 0, absent: 0, total: 0 });

  const fetchAttendance = async () => {
    try {
      if (!user?.$id) return;

      const institutionId = typeof user.institution === 'string' ? user.institution : user.institution.$id;
      const yearsRes = await academicYearService.list(institutionId);
      const currentYear = yearsRes.documents.find(y => y.isCurrent);

      const res = await attendanceRecordService.listByStudent(user.$id);

      // Filter by Current Academic Year
      const allRecords = res.documents.filter(r => {
        if (!currentYear) return true;
        const rYear = r.attendance?.class?.academicYear;
        const rYearId = typeof rYear === 'string' ? rYear : rYear?.$id;
        return rYearId === currentYear.$id;
      });

      setRecords(allRecords);
      setStats({
        present: allRecords.filter(r => r.present).length,
        absent: allRecords.filter(r => !r.present).length,
        total: allRecords.length
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
    <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 px-6 pt-6">
        <PageHeader title="Attendance History" subtitle="Track your daily attendance" />

        {/* Stats Row */}
        <View className="flex-row gap-3 mb-6">
          <StatBox label="Total Classes" value={stats.total} color="bg-blue-500" icon="list" delay={100} />
          <StatBox label="Present" value={stats.present} color="bg-green-500" icon="checkmark" delay={200} />
          <StatBox label="Absent" value={stats.absent} color="bg-red-500" icon="close" delay={300} />
        </View>

        {/* List */}
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#2563EB" className="mt-10" />
        ) : (
          <Animated.FlatList
            data={records}
            keyExtractor={(item) => item.$id}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInDown.delay(400 + (index * 50)).duration(400)}>
                <AttendanceCard record={item} />
              </Animated.View>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
            ListEmptyComponent={
              <View className="items-center py-10 opacity-50">
                <Ionicons name="calendar-outline" size={48} color={isDark ? "#4B5563" : "#D1D5DB"} />
                <Text className={`mt-4 text-lg ${isDark ? "text-gray-500" : "text-gray-400"}`}>No records found</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

export default Attendance;