import ActionButton from "@/components/admin/ActionButtons";
import StatCard from "@/components/admin/StatCard";
import StatusRow from "@/components/admin/StatusRow";
import { useClasses } from "@/store/hooks/useClasses";
import { useCourses } from "@/store/hooks/useCourses";
import { useStudents } from "@/store/hooks/useStudents";
import { useTeachers } from "@/store/hooks/useTeachers";
import { institutionStorage } from "@/utils/institutionStorage";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import { useAuth } from "../../store/hooks/useAuth";

const AdminDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { data: courses, fetchCourses } = useCourses();
  const { data: classes, fetchClasses } = useClasses();
  const { data: teachers, fetchTeachers } = useTeachers();
  const { data: students, fetchStudents } = useStudents();

  useEffect(() => {
    const loadDashboardData = async () => {
      const institutionId =
        user?.institution.$id ||
        (await institutionStorage.getInstitutionId());

      if (!institutionId) return;

      fetchCourses(institutionId);
      fetchClasses(institutionId);
      fetchTeachers(institutionId);
      fetchStudents(institutionId);
    };

    loadDashboardData();
  }, [user]);

  return (
    <ScrollView className="flex-1 bg-background dark:bg-dark-background px-6 pt-6">
      
      {/* HEADER */}
      <View className="mb-6">
        <Text className="text-sm text-textSecondary dark:text-dark-textSecondary">
          Welcome back,
        </Text>
        <Text className="text-2xl font-bold text-textPrimary dark:text-dark-textPrimary">
          {user?.name}
        </Text>
      </View>

      {/* STATS GRID */}
      <View className="flex-row flex-wrap justify-between mb-6">
        <StatCard onClick={() => router.navigate('/(admin)/courses')} title="Courses" value={`${courses?.length || 0}`} />
        <StatCard onClick={() => router.navigate('/(admin)/classes')} title="Classes" value={`${classes?.length || 0}`} />
        <StatCard onClick={() => router.navigate('/(admin)/teachers')} title="Teachers" value={`${teachers?.length || 0}`} />
        <StatCard onClick={() => router.navigate('/(admin)/students')} title="Students" value={`${students?.length || 0}`} />
      </View>

      {/* QUICK ACTIONS */}
      <Text className="text-lg font-semibold text-textPrimary dark:text-dark-textPrimary mb-3">
        Quick Actions
      </Text>

      <View className="bg-card dark:bg-dark-card rounded-2xl p-4 mb-6 border border-border dark:border-dark-border">
        <ActionButton onClick={() => router.navigate('/(admin)/courses/create')} icon="book-outline" label="Add Course" />
        <ActionButton onClick={() => router.navigate('/(admin)/classes/create')} icon="school-outline" label="Create Class" />
        <ActionButton onClick={() => router.navigate('/(admin)/teachers/create')} icon="person-add-outline" label="Add Teacher" />
        <ActionButton onClick={() => router.navigate('/(admin)/students/create')} icon="person-outline" label="Add Student" />
        <ActionButton onClick={() => {}} icon="link-outline" label="Assign Teacher" />
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
  );
};

export default AdminDashboard;
