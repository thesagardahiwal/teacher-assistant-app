import { useTheme } from "@/store/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import AttendanceCard from "../../components/Student/AttendanceCard";
import { attendanceRecordService } from "../../services/attendanceRecord.service";
import { useAuth } from "../../store/hooks/useAuth";
import { AttendanceRecord } from "../../types";

const Attendance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const { isDark } = useTheme();
  const fetchAttendance = async () => {
    try {
      if (!user?.$id) return;
      const res = await attendanceRecordService.listByStudent(user.$id);
      setRecords(res.documents);
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
    <View className="flex-1 bg-background dark:bg-dark-background">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="p-4 border-b border-border dark:border-dark-border flex-row items-center justify-left gap-4">
        <Link href=".." asChild>
          <TouchableOpacity>
            <Ionicons name="arrow-back" size={24} color={isDark ? "#FFFFFF" : "#000000"} />
          </TouchableOpacity>
        </Link>
        <Text className="text-xl font-bold text-textPrimary dark:text-dark-textPrimary">
          Attendance History
        </Text>
      </View>

      {/* List */}
      {loading && !refreshing ? (
        <ActivityIndicator size="large" className="mt-10" />
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => <AttendanceCard record={item} />}
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View className="items-center py-10 opacity-50">
              <Text className="text-textSecondary dark:text-dark-textSecondary text-lg">No records found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default Attendance;