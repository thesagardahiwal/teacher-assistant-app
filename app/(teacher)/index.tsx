import { NextClassCard } from "@/components/teacher/NextClassCard";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
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
        { label: "Courses", value: courses.length, icon: "book-open-variant", color: "text-blue-500", bg: "bg-blue-300 dark:bg-blue-900/30" },
        { label: "Classes", value: classes.length, icon: "calendar-clock", color: "text-violet-500", bg: "bg-violet-300 dark:bg-violet-900/30" },
        { label: "Teachers", value: teachers.length, icon: "school", color: "text-teal-500", bg: "bg-teal-300 dark:bg-teal-900/30" },
        { label: "Students", value: students.length, icon: "account-group", color: "text-indigo-500", bg: "bg-indigo-300 dark:bg-indigo-900/30" },
    ] : [
        { label: "My Classes", value: assignments.length, icon: "book-open-variant", color: "text-blue-500", bg: "bg-blue-300 dark:bg-blue-900/30" },
        { label: "Students", value: students.length, icon: "account-group", color: "text-indigo-500", bg: "bg-indigo-300 dark:bg-indigo-900/30" },
        { label: "Attendance", value: attendanceHistory.length, icon: "clipboard-check", color: "text-green-500", bg: "bg-green-300 dark:bg-green-900/30" },
    ];

    const QuickAction = ({
        icon,
        label,
        onPress,
        bgColor,
        className,
        iconLibrary = "MaterialCommunityIcons"
    }: {
        icon: any;
        label: string;
        onPress: () => void;
        bgColor: string;
        className?: string;
        iconLibrary?: "MaterialCommunityIcons" | "Ionicons"
    }) => (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            className={`p-4 rounded-2xl ${isDark ? "bg-gray-800" : "bg-white"} shadow-sm ${className || ''}`}
        >
            <View className={`w-12 h-12 rounded-full ${bgColor} items-center justify-center mb-3`}>
                {iconLibrary === "Ionicons" ? (
                    <Ionicons name={icon} size={22} color="white" />
                ) : (
                    <MaterialCommunityIcons name={icon} size={22} color="white" />
                )}
            </View>
            <Text className={`font-semibold text-sm ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
            <ScrollView
                className="w-full flex-1"
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Header */}
                <View className="flex-row justify-between items-center px-5 py-4">
                    <View>
                        <Text className={`text-lg font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Welcome back,</Text>
                        <Text className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{user?.name}</Text>
                        {isPrincipal && <Text className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">Principal Access</Text>}
                    </View>
                    <TouchableOpacity onPress={() => router.push("/(teacher)/profile")}>
                        <View className="w-10 h-10 rounded-full bg-blue-600 items-center justify-center">
                            <Text className="text-white font-bold text-lg">{user?.name?.charAt(0)}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Stats Grid */}
                <View className="flex-row flex-wrap px-3 mb-6 justify-between">
                    {stats.map((stat, index) => (
                        <View key={index} className={`w-[${isPrincipal ? '48%' : '32%'}] md:w-[${isPrincipal ? '23%' : '32%'}] p-1`}>
                            <View className={`p-3 rounded-xl items-center ${isDark ? "bg-gray-800" : "bg-white"} shadow-sm h-32 justify-center`}>
                                <View className={`w-10 h-10 rounded-full ${stat.bg} items-center justify-center mb-2`}>
                                    <MaterialCommunityIcons name={stat.icon as any} size={20} color={'white'} className={stat.color} />
                                </View>
                                <Text className={`text-xl md:text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{stat.value}</Text>
                                <Text className={`text-[10px] md:text-xs text-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>{stat.label}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Next Class Card (Hidden for Principals for now to save space, or can be kept) */}
                {!isPrincipal && (
                    <View className="px-5 mb-8">
                        <NextClassCard nextClass={nextClass} isDark={isDark} />
                    </View>
                )}

                {/* Quick Actions */}
                <View className="px-5 mb-8">
                    <Text className={`text-lg font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                        Quick Actions
                    </Text>

                    <View className="flex-row flex-wrap gap-3">
                        {isPrincipal ? (
                            <>
                                <QuickAction
                                    className="w-[48%] md:w-[23%]"
                                    icon="school-outline"
                                    iconLibrary="Ionicons"
                                    label="Teachers"
                                    bgColor="bg-blue-500"
                                    onPress={() => router.push("/(teacher)/teachers")}
                                />
                                <QuickAction
                                    className="w-[48%] md:w-[23%]"
                                    icon="people-outline"
                                    iconLibrary="Ionicons"
                                    label="Students"
                                    bgColor="bg-indigo-500"
                                    onPress={() => router.push("/(teacher)/students")}
                                />
                                <QuickAction
                                    className="w-[48%] md:w-[23%]"
                                    icon="calendar-outline"
                                    iconLibrary="Ionicons"
                                    label="Classes"
                                    bgColor="bg-violet-500"
                                    onPress={() => router.push("/(teacher)/classes")}
                                />
                                <QuickAction
                                    className="w-[48%] md:w-[23%]"
                                    icon="link-outline"
                                    iconLibrary="Ionicons"
                                    label="Assign Teacher"
                                    bgColor="bg-purple-500"
                                    // @ts-ignore - Route exists but types might be stale
                                    onPress={() => router.push("/(teacher)/assignments/create" as any)}
                                />
                                <QuickAction
                                    className="w-[48%] md:w-[23%]"
                                    icon="book-open-page-variant-outline"
                                    iconLibrary="MaterialCommunityIcons"
                                    label="Courses"
                                    bgColor="bg-teal-500"
                                    onPress={() => router.push("/(teacher)/courses")}
                                />
                            </>
                        ) : (
                            <>
                                <QuickAction
                                    className="w-[48%] md:w-[23%]"
                                    icon="check-circle-outline"
                                    label="Attendance"
                                    bgColor="bg-green-500"
                                    onPress={() => router.push("/(teacher)/attendance")}
                                />
                                <QuickAction
                                    className="w-[48%] md:w-[23%]"
                                    icon="calendar-clock"
                                    label="My Schedule"
                                    bgColor="bg-purple-500"
                                    onPress={() => router.push("/(teacher)/schedule")}
                                />
                                <QuickAction
                                    className="w-[48%] md:w-[23%]"
                                    icon="clipboard-text-outline"
                                    label="Assessments"
                                    bgColor="bg-red-500"
                                    onPress={() => router.push("/(teacher)/assessments")}
                                />
                                <QuickAction
                                    className="w-[48%] md:w-[23%]"
                                    icon="format-list-bulleted"
                                    label="My Classes"
                                    bgColor="bg-indigo-500"
                                    onPress={() => router.push("/(teacher)/classes")}
                                />
                                <QuickAction
                                    className="w-[48%] md:w-[23%]"
                                    icon="account-search"
                                    label="Find Student"
                                    bgColor="bg-orange-500"
                                    onPress={() => router.push("/(teacher)/students")}
                                />
                                <QuickAction
                                    className="w-[48%] md:w-[23%]"
                                    icon="folder-open"
                                    label="Study Vault"
                                    bgColor="bg-amber-500"
                                    onPress={() => router.push("/(teacher)/study-vault")}
                                />
                            </>
                        )}

                        {/* Shared Actions (if any) - keeping Calendar common */}
                        <QuickAction
                            className="w-[48%] md:w-[23%]"
                            icon="calendar-month"
                            label="Calendar"
                            bgColor="bg-cyan-500"
                            onPress={() => router.push("/(teacher)/calendar")}
                        />
                    </View>
                </View>

                {/* Recent Activity (Teachers Only for now, or unified later) */}
                {!isPrincipal && (
                    <View className="px-5">
                        <Text className={`text-lg font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>Recent Activity</Text>
                        {attendanceHistory.slice(0, 3).map((item) => (
                            <View key={item.$id} className={`flex-row items-center p-3 mb-3 rounded-xl ${isDark ? "bg-gray-800" : "bg-white"} shadow-sm`}>
                                <View className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-3">
                                    <MaterialCommunityIcons name="check" size={20} className="text-green-600 dark:text-green-400" />
                                </View>
                                <View className="flex-1">
                                    <Text className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Attendance Taken</Text>
                                    <Text className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                        {item.class?.name ? `Class ${item.class.name}` : ""} • {item.subject?.name}
                                    </Text>
                                </View>
                                <Text className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>{new Date(item.date).toLocaleDateString()}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
