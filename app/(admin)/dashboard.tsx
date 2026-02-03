import StatusRow from "@/components/admin/StatusRow";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { useClasses } from "@/store/hooks/useClasses";
import { useCourses } from "@/store/hooks/useCourses";
import { useStudents } from "@/store/hooks/useStudents";
import { useTeachers } from "@/store/hooks/useTeachers";
import { useTheme } from "@/store/hooks/useTheme";
import { institutionStorage } from "@/utils/institutionStorage";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
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

  const stats = [
    { label: "Courses", value: courses?.length || 0, icon: "book-open-variant" },
    { label: "Classes", value: classes?.length || 0, icon: "google-classroom" }, // Using google-classroom as closest match or calendar-clock
    { label: "Teachers", value: teachers?.length || 0, icon: "account-tie" },
    { label: "Students", value: students?.length || 0, icon: "school" },
  ];

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <ScrollView
        className="flex-1 w-full"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <DashboardHeader user={user} isDark={isDark} />

        <StatsGrid stats={stats as any} isDark={isDark} />

        {/* DIRECTORIES */}
        <View className="px-5 mb-8">
          <Text className="text-lg font-bold text-textPrimary dark:text-dark-textPrimary mb-4">
            Directories
          </Text>

          <View className="flex-row flex-wrap gap-3">
            <QuickActionCard
              className="w-[48%] md:w-[23%]"
              onPress={() => router.navigate('/(admin)/classes')}
              icon="google-classroom"
              label="All Classes"
              isDark={isDark}
            />
            <QuickActionCard
              className="w-[48%] md:w-[23%]"
              onPress={() => router.navigate('/(admin)/courses')}
              icon="book-open-page-variant"
              label="All Courses"
              isDark={isDark}
            />
          </View>
        </View>

        {/* MANAGEMENT ACTIONS */}
        <View className="px-5 mb-8">
          <Text className="text-lg font-bold text-textPrimary dark:text-dark-textPrimary mb-4">
            Management
          </Text>

          <View className="flex-row flex-wrap gap-3">
            <QuickActionCard
              className="w-[48%] md:w-[23%]"
              onPress={() => router.navigate('/(admin)/teachers/create')}
              icon="account-plus-outline"
              isDark={isDark}
              label="Add Teacher"
            />
            <QuickActionCard
              className="w-[48%] md:w-[23%]"
              onPress={() => router.navigate('/(admin)/students/create')}
              icon="school-outline"
              iconLibrary="Ionicons"
              label="Add Student"
              isDark={isDark}
            />
            <QuickActionCard
              className="w-[48%] md:w-[23%]"
              onPress={() => router.navigate('/(admin)/classes/create')}
              icon="people-outline"
              iconLibrary="Ionicons"
              isDark={isDark}
              label="Create Class"
            />
            <QuickActionCard
              className="w-[48%] md:w-[23%]"
              onPress={() => router.navigate('/(admin)/assignments/create')}
              icon="link-variant"
              isDark={isDark}
              label="Assign Teacher"
            />
          </View>
        </View>

        {/* ACADEMIC ACTIONS */}
        <View className="px-5 mb-8">
          <Text className="text-lg font-bold text-textPrimary dark:text-dark-textPrimary mb-4">
            Academics
          </Text>

          <View className="flex-row flex-wrap gap-3">
            <QuickActionCard
              className="w-[48%] md:w-[23%]"
              onPress={() => router.navigate('/(admin)/courses/create')}
              icon="book-outline"
              iconLibrary="Ionicons"
              label="Add Course"
              isDark={isDark}
            />
            <QuickActionCard
              className="w-[48%] md:w-[23%]"
              onPress={() => router.navigate('/(admin)/subjects/create')}
              icon="library-outline"
              iconLibrary="Ionicons"
              label="Add Subject"
              isDark={isDark}
            />
            <QuickActionCard
              className="w-[48%] md:w-[23%]"
              onPress={() => router.navigate('/(admin)/academic-years')}
              icon="calendar-outline"
              iconLibrary="Ionicons"
              label="Academic Years"
              isDark={isDark}
            />
            <QuickActionCard
              className="w-[48%] md:w-[23%]"
              onPress={() => router.navigate('/(admin)/schedules')}
              icon="time-outline"
              label="Schedules"
              isDark={isDark}
              iconLibrary="Ionicons"
            />
          </View>
        </View>

        {/* SYSTEM STATUS */}
        <View className="px-5 mb-6">
          <Text className="text-lg font-bold text-textPrimary dark:text-dark-textPrimary mb-3">
            System Status
          </Text>

          <View className="bg-white dark:bg-dark-card rounded-2xl p-4 border border-border/50 dark:border-dark-border shadow-sm">
            <StatusRow label="Institution Setup" status="Completed" />
            <StatusRow label="Academic Year" status="Active" />
            <StatusRow label="Data Sync" status="Healthy" />
          </View>
        </View>

        {/* FOOTER */}
        <Text className="text-xs text-muted dark:text-dark-muted text-center mt-4 mb-2">
          Teachora · Secure Academic Management Platform
        </Text>
      </ScrollView>
    </View>
  );
};

export default AdminDashboard;
