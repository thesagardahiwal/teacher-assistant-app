import StatCard from "@/components/admin/StatCard";
import StatusRow from "@/components/admin/StatusRow";
import { useClasses } from "@/store/hooks/useClasses";
import { useCourses } from "@/store/hooks/useCourses";
import { useStudents } from "@/store/hooks/useStudents";
import { useTeachers } from "@/store/hooks/useTeachers";
import { useTheme } from "@/store/hooks/useTheme";
import { institutionStorage } from "@/utils/institutionStorage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../store/hooks/useAuth";

const AdminDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { data: courses, fetchCourses } = useCourses();
  const { data: classes, fetchClasses } = useClasses();
  const { data: teachers, fetchTeachers } = useTeachers();
  const { data: students, fetchStudents } = useStudents();
  const { isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const institutionId =
      typeof user?.institution === "string" ? user?.institution : user?.institution?.$id ||
        (await institutionStorage.getInstitutionId());

    if (!institutionId) {
      console.warn("No Institution ID found, skipping data fetch");
      return;
    }

    await Promise.all([
      fetchCourses(institutionId),
      fetchClasses(institutionId),
      fetchTeachers(institutionId),
      fetchStudents(institutionId)
    ]);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [user]);

  const QuickAction = ({
    icon,
    label,
    onPress,
    bgColor,
    className,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    bgColor: string;
    className?: string; // Added optional className
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`p-4 rounded-2xl ${isDark ? "bg-gray-800" : "bg-white"} shadow-sm ${className || ''}`}
    >
      <View className={`w-12 h-12 rounded-full ${bgColor} items-center justify-center mb-3`}>
        <Ionicons name={icon} size={22} color="white" />
      </View>
      <Text className={`font-semibold text-sm ${isDark ? "text-gray-200" : "text-gray-700"}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <ScrollView
        className="flex-1 w-full"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

        {/* HEADER */}
        <View className="mb-6 sticky top-0 z-10 flex-row items-center justify-between">
          <View>
            <Text className="text-sm text-textSecondary dark:text-dark-textSecondary">
              Welcome back,
            </Text>
            <Text className="text-2xl font-bold text-textPrimary dark:text-dark-textPrimary">
              {user?.name}
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(admin)/profile")} className="bg-card dark:bg-dark-card p-2 rounded-full border border-border dark:border-dark-border">
            <View className="w-8 h-8 rounded-full bg-primary dark:bg-dark-primary items-center justify-center">
              <Text className="text-white font-bold text-lg">{user?.name?.charAt(0)}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* STATS GRID */}
        <View className="flex-row flex-wrap justify-between mb-8">
          <StatCard className="w-[48%] md:w-[23%]" onClick={() => router.navigate('/(admin)/courses')} title="Courses" value={`${courses?.length || 0}`} />
          <StatCard className="w-[48%] md:w-[23%]" onClick={() => router.navigate('/(admin)/classes')} title="Classes" value={`${classes?.length || 0}`} />
          <StatCard className="w-[48%] md:w-[23%]" onClick={() => router.navigate('/(admin)/teachers')} title="Teachers" value={`${teachers?.length || 0}`} />
          <StatCard className="w-[48%] md:w-[23%]" onClick={() => router.navigate('/(admin)/students')} title="Students" value={`${students?.length || 0}`} />
        </View>

        {/* MANAGEMENT ACTIONS */}
        <Text className="text-lg font-bold text-textPrimary dark:text-dark-textPrimary mb-4">
          Management
        </Text>

        <View className="flex-row flex-wrap gap-3 mb-6">
          <QuickAction
            className="w-[48%] md:w-[23%]"
            onPress={() => router.navigate('/(admin)/teachers/create')}
            icon="person-add-outline"
            label="Add Teacher"
            bgColor="bg-blue-500"
          />
          <QuickAction
            className="w-[48%] md:w-[23%]"
            onPress={() => router.navigate('/(admin)/students/create')}
            icon="school-outline"
            label="Add Student"
            bgColor="bg-indigo-500"
          />
          <QuickAction
            className="w-[48%] md:w-[23%]"
            onPress={() => router.navigate('/(admin)/classes/create')}
            icon="people-outline"
            label="Create Class"
            bgColor="bg-violet-500"
          />
          <QuickAction
            className="w-[48%] md:w-[23%]"
            onPress={() => router.navigate('/(admin)/assignments/create')}
            icon="person-circle-outline"
            label="Assign Teacher"
            bgColor="bg-purple-500"
          />
        </View>

        {/* ACADEMIC ACTIONS */}
        <Text className="text-lg font-bold text-textPrimary dark:text-dark-textPrimary mb-4">
          Academics
        </Text>

        <View className="flex-row flex-wrap gap-3 mb-6">
          <QuickAction
            className="w-[48%] md:w-[23%]"
            onPress={() => router.navigate('/(admin)/courses/create')}
            icon="book-outline"
            label="Add Course"
            bgColor="bg-amber-500"
          />
          <QuickAction
            className="w-[48%] md:w-[23%]"
            onPress={() => router.navigate('/(admin)/subjects/create')}
            icon="library-outline"
            label="Add Subject"
            bgColor="bg-orange-500"
          />
          <QuickAction
            className="w-[48%] md:w-[23%]"
            onPress={() => router.navigate('/(admin)/academic-years')}
            icon="calendar-outline"
            label="Academic Years"
            bgColor="bg-emerald-500"
          />
          <QuickAction
            className="w-[48%] md:w-[23%]"
            onPress={() => router.navigate('/(admin)/schedules')}
            icon="time-outline"
            label="Schedules"
            bgColor="bg-teal-500"
          />
        </View>


        {/* SYSTEM STATUS */}
        <Text className="text-lg font-semibold text-textPrimary dark:text-dark-textPrimary mb-3">
          System Status
        </Text>

        <View className="bg-card dark:bg-dark-card rounded-2xl p-4 border border-border dark:border-dark-border">
          <StatusRow label="Institution Setup" status="Completed" />
          <StatusRow label="Academic Year" status="Active" />
          <StatusRow label="Data Sync" status="Healthy" />
        </View>

        {/* FOOTER */}
        <Text className="text-xs text-muted dark:text-dark-muted text-center mt-8">
          Teachora · Secure Academic Management Platform
        </Text>
      </ScrollView>
    </View>
  );
};

export default AdminDashboard;
