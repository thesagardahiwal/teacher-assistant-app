import ActionButton from "@/components/admin/ActionButtons";
import StatCard from "@/components/admin/StatCard";
import StatusRow from "@/components/admin/StatusRow";
import { useAuth } from "@/store/hooks/useAuth";
import { useClasses } from "@/store/hooks/useClasses";
import { useCourses } from "@/store/hooks/useCourses";
import { useStudents } from "@/store/hooks/useStudents";
import { useTeachers } from "@/store/hooks/useTeachers";
import { institutionStorage } from "@/utils/institutionStorage";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";

const PrincipalDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { data: courses, fetchCourses } = useCourses();
  const { data: classes, fetchClasses } = useClasses();
  const { data: teachers, fetchTeachers } = useTeachers();
  const { data: students, fetchStudents } = useStudents();

  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const institutionId =
      typeof user?.institution === "string" ? user?.institution : user?.institution?.$id ||
        (await institutionStorage.getInstitutionId());

    if (!institutionId) {
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

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <ScrollView
        className="flex-1"
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
            <Text className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              Principal Dashboard
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(principal)/principal-profile")} className="bg-card dark:bg-dark-card p-2 rounded-full border border-border dark:border-dark-border">
            <View className="w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 items-center justify-center">
              <Text className="text-white font-bold text-lg">{user?.name?.charAt(0)}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* STATS GRID - Read Only Access */}
        <View className="flex-row flex-wrap justify-between mb-6">
          <StatCard onClick={() => router.navigate('/(admin)/courses')} title="Courses" value={`${courses?.length || 0}`} />
          <StatCard onClick={() => router.navigate('/(admin)/classes')} title="Classes" value={`${classes?.length || 0}`} />
          <StatCard onClick={() => router.navigate('/(admin)/teachers')} title="Teachers" value={`${teachers?.length || 0}`} />
          <StatCard onClick={() => router.navigate('/(admin)/students')} title="Students" value={`${students?.length || 0}`} />
        </View>

        {/* QUICK ACTIONS - Limited for Principal */}
        <Text className="text-lg font-semibold text-textPrimary dark:text-dark-textPrimary mb-3">
          Quick Actions
        </Text>

        <View className="bg-card dark:bg-dark-card rounded-2xl p-4 mb-6 border border-border dark:border-dark-border">
          <ActionButton onClick={() => router.navigate('/(admin)/assignments/create')} icon="link-outline" label="Assign Teacher" />
          {/* Principal can manage assignments, but not create core entities */}
        </View>

        {/* SYSTEM STATUS */}
        <Text className="text-lg font-semibold text-textPrimary dark:text-dark-textPrimary mb-3">
          System Overview
        </Text>

        <View className="bg-card dark:bg-dark-card rounded-2xl p-4 border border-border dark:border-dark-border">
          <StatusRow label="Institution Setup" status="Active" />
          <StatusRow label="Academic Year" status="Current" />
        </View>

        {/* FOOTER */}
        <Text className="text-xs text-muted dark:text-dark-muted text-center mt-8">
          Teachora · Principal Access
        </Text>
      </ScrollView>
    </View>
  );
};

export default PrincipalDashboard;