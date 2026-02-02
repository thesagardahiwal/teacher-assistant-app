import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { NextClassCard } from "@/components/teacher/NextClassCard";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { scheduleService } from "../../services";
import { useAssignments } from "../../store/hooks/useAssignments";
import { useAttendance } from "../../store/hooks/useAttendance";
import { useAuth } from "../../store/hooks/useAuth";
import { useClasses } from "../../store/hooks/useClasses";
import { useCourses } from "../../store/hooks/useCourses";
import { useStudents } from "../../store/hooks/useStudents";
import { useTeachers } from "../../store/hooks/useTeachers";
import { useTheme } from "../../store/hooks/useTheme";
import { ClassScheduleWithStatus } from "../../types/schedule.type";
import { useInstitutionId } from "../../utils/useInstitutionId";

export default function TeacherDashboard() {
    const router = useRouter();
    const { user } = useAuth();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();

    const { data: assignments, fetchAssignments } = useAssignments();
    const { data: attendanceHistory, fetchAttendance } = useAttendance();
    const { data: students, fetchStudents } = useStudents();
    const { data: courses, fetchCourses } = useCourses();
    const { data: classes, fetchClasses } = useClasses();
    const { data: teachers, fetchTeachers } = useTeachers();

    const [refreshing, setRefreshing] = useState(false);
    const [nextClass, setNextClass] = useState<ClassScheduleWithStatus | null>(null);

    const isPrincipal = user?.role === "PRINCIPAL" || user?.role === "VICE_PRINCIPAL";

    const loadData = async () => {
        if (!institutionId) return;

        // Fetch user specific data
        if (user?.$id) {
            await fetchAssignments(institutionId, user.$id);
            await fetchAttendance(institutionId, user.$id);
        }

        // Fetch Role Specific Data
        if (isPrincipal) {
            await Promise.all([
                fetchCourses(institutionId),
                fetchClasses(institutionId),
                fetchTeachers(institutionId),
                fetchStudents(institutionId)
            ]);
        } else if (assignments.length > 0) {
            // Teacher: Load students for assigned classes
            const classIds = assignments.map((a) => a.class.$id);
            if (classIds.length > 0) {
                await fetchStudents(institutionId, classIds);
            }
        }

        if (user?.$id && !isPrincipal) {
            // Fetch Next Class
            const now = new Date();
            const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
            const currentDay = days[now.getDay()];
            const currentTime = now.toTimeString().slice(0, 5);

            try {
                let res = await scheduleService.getNextClassForTeacher(user.$id, currentDay, currentTime);
                if (res && res.documents.length > 0) {
                    setNextClass({ ...res.documents[0], status: 'Upcoming' });
                } else {
                    res = await scheduleService.getPreviousClassForTeacher(user.$id, currentDay, currentTime);
                    if (res && res.documents.length > 0) {
                        setNextClass({ ...res.documents[0], status: 'Previous' });
                    } else {
                        setNextClass(null);
                    }
                }
            } catch (error) {
                console.error("Error fetching class:", error);
            }
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [institutionId, user, isPrincipal])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, [institutionId, user, isPrincipal]);

    const stats = isPrincipal ? [
        { label: "Courses", value: courses.length, icon: "book-open-variant" },
        { label: "Classes", value: classes.length, icon: "calendar-clock" },
        { label: "Teachers", value: teachers.length, icon: "school" },
        { label: "Students", value: students.length, icon: "account-group" },
    ] : [
        { label: "My Classes", value: assignments.length, icon: "book-open-variant" },
        { label: "Students", value: students.length, icon: "account-group" },
        { label: "Attendance", value: attendanceHistory.length, icon: "clipboard-check" },
    ];

    return (
        <View className="flex-1 bg-background dark:bg-dark-background">
            <ScrollView
                className="w-full flex-1"
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <DashboardHeader
                    user={user}
                    isDark={isDark}
                    subtitle={isPrincipal ? "Principal Access" : "Welcome back,"}
                />

                <StatsGrid stats={stats as any} isDark={isDark} />

                {/* Next Class Card */}
                {!isPrincipal && (
                    <View className="px-5 mb-8">
                        <NextClassCard nextClass={nextClass} isDark={isDark} />
                    </View>
                )}

                {/* Quick Actions */}
                <View className="px-5 mb-8">
                    <Text className="text-lg font-bold mb-4 text-textPrimary dark:text-dark-textPrimary">
                        Quick Actions
                    </Text>

                    <View className="flex-row flex-wrap gap-3">
                        {isPrincipal && (
                            <>
                                <QuickActionCard
                                    className="w-[48%] md:w-[23%]"
                                    icon="school-outline"
                                    iconLibrary="Ionicons"
                                    label="Teachers"
                                    isDark={isDark}
                                    onPress={() => router.push("/(teacher)/teachers")}
                                />
                                <QuickActionCard
                                    className="w-[48%] md:w-[23%]"
                                    icon="people-outline"
                                    iconLibrary="Ionicons"
                                    label="Students"
                                    isDark={isDark}
                                    onPress={() => router.push("/(teacher)/students")}
                                />
                                <QuickActionCard
                                    className="w-[48%] md:w-[23%]"
                                    icon="calendar-outline"
                                    iconLibrary="Ionicons"
                                    label="Classes"
                                    isDark={isDark}
                                    onPress={() => router.push("/(teacher)/classes")}
                                />
                                <QuickActionCard
                                    className="w-[48%] md:w-[23%]"
                                    icon="link-outline"
                                    iconLibrary="Ionicons"
                                    label="Assign Teacher"
                                    isDark={isDark}
                                    // @ts-ignore
                                    onPress={() => router.push("/(teacher)/assignments/create" as any)}
                                />
                                <QuickActionCard
                                    className="w-[48%] md:w-[23%]"
                                    icon="book-open-page-variant-outline"
                                    iconLibrary="MaterialCommunityIcons"
                                    label="Courses"
                                    isDark={isDark}
                                    onPress={() => router.push("/(teacher)/courses")}
                                />
                            </>
                        )}
                        <>
                            <QuickActionCard
                                className="w-[48%] md:w-[23%]"
                                icon="calendar-clock"
                                label="My Schedule"
                                isDark={isDark}
                                onPress={() => router.push("/(teacher)/schedule")}
                            />
                            <QuickActionCard
                                className="w-[48%] md:w-[23%]"
                                icon="clipboard-text-outline"
                                label="Assessments"
                                isDark={isDark}
                                onPress={() => router.push("/(teacher)/assessments")}
                            />
                            <QuickActionCard
                                className="w-[48%] md:w-[23%]"
                                icon="folder-open"
                                isDark={isDark}
                                label="Study Vault"
                                onPress={() => router.push("/(teacher)/study-vault")}
                            />
                        </>
                    </View>
                </View>

                {/* Recent Activity */}
                {attendanceHistory.length > 0 && (
                    <View className="px-5">
                        <Text className="text-lg font-bold mb-3 text-textPrimary dark:text-dark-textPrimary">Recent Activity</Text>
                        {attendanceHistory.slice(0, 3).map((item) => (
                            <View key={item.$id} className="flex-row items-center p-4 mb-3 rounded-2xl bg-white dark:bg-dark-card shadow-sm border border-border/50 dark:border-dark-border">
                                <View className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-3">
                                    <MaterialCommunityIcons name="check" size={20} className="text-green-600 dark:text-green-400" />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-bold text-textPrimary dark:text-dark-textPrimary">Attendance Taken</Text>
                                    <Text className="text-xs text-textSecondary dark:text-dark-textSecondary mt-0.5">
                                        {item.class?.name ? `Class ${item.class.name}` : ""} • {item.subject?.name}
                                    </Text>
                                </View>
                                <Text className="text-xs text-muted dark:text-dark-muted font-medium">{new Date(item.date).toLocaleDateString()}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
