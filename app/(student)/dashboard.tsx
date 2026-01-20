import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AttendanceCard from "../../components/Student/AttendanceCard";
import { attendanceRecordService } from "../../services/attendanceRecord.service";
import { useAuth } from "../../store/hooks/useAuth";
import { AttendanceRecord } from "../../types";

// Helper component for Stat Cards
const StatCard = ({ label, value, colorClass, textColorClass }: any) => (
  <View className={`flex-1 p-4 rounded-2xl ${colorClass} mx-1 shadow-sm`}>
    <Text className={`text-3xl font-bold ${textColorClass} mb-1`}>{value}</Text>
    <Text className={`text-sm font-medium ${textColorClass} opacity-80`}>{label}</Text>
  </View>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState({ present: 0, absent: 0, total: 0, percentage: 0 });

  const fetchAttendance = async () => {
    try {
      if (!user?.$id) return;
      // Note: Assuming user.$id is the student ID for STUDENT role (as per partial fix) 
      // OR we need to find the student ID if user.$id is the Auth ID.
      // Based on fix: user object for student has $id as student doc ID.
      const res = await attendanceRecordService.listByStudent(user.$id);

      const allRecords = res.documents;
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
    <View className="flex-1 bg-background dark:bg-dark-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        className="px-6"
      >
        {/* Header */}
        <View className="mb-6 flex-row justify-between items-center">
          <View>
            <Text className="text-lg text-textSecondary dark:text-dark-textSecondary font-medium">
              Welcome back,
            </Text>
            <Text className="text-3xl font-bold text-primary dark:text-dark-primary mt-1">
              {user?.name}
            </Text>
            <Text className="text-sm text-textSecondary dark:text-dark-textSecondary mt-1">
              Student • {user?.institution?.name || "Institution"}
            </Text>
          </View>
          <Link href="/(student)/profile" asChild>
            <TouchableOpacity className="bg-card dark:bg-dark-card p-2 rounded-full border border-border dark:border-dark-border">
              {/* Simple Avatar Icon or Placeholder */}
              <View className="w-10 h-10 bg-primary/20 rounded-full items-center justify-center">
                <Text className="text-primary font-bold text-lg">{user?.name?.charAt(0) || "U"}</Text>
              </View>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Attendance Summary Card */}
        <View className="bg-primary dark:bg-dark-primary rounded-3xl p-6 shadow-md mb-6">
          <Text className="text-white text-lg font-medium opacity-90 mb-2">Overall Attendance</Text>
          <View className="flex-row items-end">
            <Text className="text-6xl font-black text-white">{stats.percentage}%</Text>
            <Text className="text-white text-lg font-medium mb-3 ml-2 opacity-90">Present</Text>
          </View>
          <View className="mt-4 flex-row gap-2">
            <View className="bg-white/20 px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-semibold">Targets: 75% requires</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View className="flex-row gap-4 mb-8">
          <StatCard
            label="Total Classes"
            value={stats.total}
            colorClass="bg-card dark:bg-dark-card border border-border dark:border-dark-border"
            textColorClass="text-textPrimary dark:text-dark-textPrimary"
          />
          <StatCard
            label="Present"
            value={stats.present}
            colorClass="bg-green-100 dark:bg-green-900/40"
            textColorClass="text-green-700 dark:text-green-400"
          />
          <StatCard
            label="Absent"
            value={stats.absent}
            colorClass="bg-red-100 dark:bg-red-900/40"
            textColorClass="text-red-700 dark:text-red-400"
          />
        </View>

        {/* Quick Links */}
        <View className="flex-row gap-4 mb-6">
          <Link href="/(student)/assessments" asChild>
            <TouchableOpacity className="flex-1 bg-blue-100 dark:bg-blue-900/30 p-4 rounded-2xl items-center flex-row">
              <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center mr-3">
                <Text className="text-white text-xl">A</Text>
              </View>
              <View>
                <Text className="font-bold text-blue-900 dark:text-blue-100">My Results</Text>
                <Text className="text-xs text-blue-700 dark:text-blue-300">Check grades</Text>
              </View>
            </TouchableOpacity>
          </Link>

          <Link href="/(student)/calendar" asChild>
            <TouchableOpacity className="flex-1 bg-purple-100 dark:bg-purple-900/30 p-4 rounded-2xl items-center flex-row">
              <View className="w-10 h-10 bg-purple-500 rounded-full items-center justify-center mr-3">
                <Ionicons name="calendar-outline" size={24} color="white" />
              </View>
              <View>
                <Text className="font-bold text-purple-900 dark:text-purple-100">Calendar</Text>
                <Text className="text-xs text-purple-700 dark:text-purple-300">Schedules & Dues</Text>
              </View>
            </TouchableOpacity>
          </Link>
        </View>

        <View className="flex-row gap-4 mb-6">
          <Link href="/(student)/study-vault" asChild>
            <TouchableOpacity className="flex-1 bg-amber-100 dark:bg-amber-900/30 p-4 rounded-2xl items-center flex-row">
              <View className="w-10 h-10 bg-amber-500 rounded-full items-center justify-center mr-3">
                <Ionicons name="folder-open-outline" size={24} color="white" />
              </View>
              <View>
                <Text className="font-bold text-amber-900 dark:text-amber-100">Study Vault</Text>
                <Text className="text-xs text-amber-700 dark:text-amber-300">Offline Files</Text>
              </View>
            </TouchableOpacity>
          </Link>
          <View className="flex-1" />
        </View>
        {/* Recent Activity Header */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-textPrimary dark:text-dark-textPrimary">
            Recent Activity
          </Text>
          <Link href="/(student)/attendance" className="text-primary dark:text-dark-primary font-semibold">
            View All
          </Link>
        </View>



        {/* Recent List */}
        {
          loading && !refreshing ? (
            <ActivityIndicator size="large" className="mt-10" />
          ) : records.length > 0 ? (
            records.slice(0, 5).map(record => (
              <AttendanceCard key={record.$id} record={record} />
            ))
          ) : (
            <View className="items-center py-10 opacity-50">
              <Text className="text-textSecondary dark:text-dark-textSecondary text-lg">No records found</Text>
            </View>
          )
        }

      </ScrollView >
    </View >
  );
};

export default Dashboard

const styles = StyleSheet.create({})