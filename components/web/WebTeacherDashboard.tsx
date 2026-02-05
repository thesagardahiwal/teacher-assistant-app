import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { scheduleService } from "@/services";
import { useAssignments } from "@/store/hooks/useAssignments";
import { useAttendance } from "@/store/hooks/useAttendance";
import { useAuth } from "@/store/hooks/useAuth";
import { useStudents } from "@/store/hooks/useStudents";
import { useTheme } from "@/store/hooks/useTheme";
import { useInstitutionId } from "@/utils/useInstitutionId";

// STAT CARD COMPONENT (Reused from Admin Dashboard source for consistency)
const WebStatCard = ({
    label,
    value,
    icon,
    gradient,
}: {
    label: string;
    value: number;
    icon: any;
    gradient: string;
}) => (
    <View
        className="flex-1 min-w-[200px] p-5 rounded-2xl border bg-white border-slate-200 dark:bg-[#1e293b] dark:border-slate-700 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
    >
        {/* Background Gradient Blob */}
        <View
            className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 ${gradient}`}
        />

        <View className="flex-row justify-between items-start mb-4">
            <View
                className="p-3 rounded-xl bg-slate-50 dark:bg-white/5"
            >
                <Ionicons
                    name={icon}
                    size={24}
                    className="text-slate-700 dark:text-white"
                />
            </View>
            <View className="bg-green-500/10 px-2 py-1 rounded-full" />
        </View>

        <Text
            className="text-3xl font-bold mb-1 text-slate-900 dark:text-white"
        >
            {value}
        </Text>
        <Text className="text-sm text-slate-500 dark:text-slate-400">
            {label}
        </Text>
    </View>
);

export default function WebTeacherDashboard() {
    const router = useRouter();
    const { user } = useAuth();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();

    const { data: assignments, fetchAssignments } = useAssignments();
    const { data: attendanceHistory, fetchAttendance } = useAttendance();
    const { data: students, fetchStudents } = useStudents();

    const [loading, setLoading] = useState(true);
    const [lecturesCount, setLecturesCount] = useState(0);

    useEffect(() => {
        const loadData = async () => {
            if (user?.$id && institutionId) {
                // Fetch assignments first to get classes
                const res: any = await fetchAssignments(institutionId, user.$id);
                const fetchedAssignments = res.payload || [];

                const promises: Promise<any>[] = [
                    fetchAttendance(institutionId, user.$id),
                    fetchScheduleCount()
                ];

                if (fetchedAssignments.length > 0) {
                    const classIds = fetchedAssignments.map((a: any) => a.class.$id);
                    if (classIds.length > 0) {
                        promises.push(fetchStudents(institutionId, classIds));
                    }
                }

                await Promise.all(promises);
            }
            setLoading(false);
        };
        loadData();
    }, [user, institutionId]);

    const fetchScheduleCount = async () => {
        if (!user?.$id) return;
        try {
            const res = await scheduleService.listByTeacher(user.$id);
            setLecturesCount(res.total || res.documents.length);
        } catch (e) {
            console.error("Failed to fetch schedule count", e);
        }
    }

    const stats = [
        {
            label: "My Classes",
            value: assignments.length,
            icon: "book-outline",
            gradient: "bg-blue-500",
        },
        {
            label: "Students",
            value: students.length,
            icon: "people-outline",
            gradient: "bg-purple-500",
        },
        {
            label: "Weekly Lectures",
            value: lecturesCount,
            icon: "calendar-outline",
            gradient: "bg-orange-500",
        },
        {
            label: "Attendance Taken",
            value: attendanceHistory.length,
            icon: "checkmark-circle-outline",
            gradient: "bg-emerald-500",
        },
    ];

    // Modify specific stat if we don't have student count easily
    // Let's replace "Students" with something else or just hide it? 
    // The previous dashboard had "Students" stat. 
    // In `app/(teacher)/index.tsx`, it uses `useStudents` hook but that fetches ALL students if not filtered?
    // The previous implementation used `fetchStudents(institutionId, classIds)` if assignments existed.
    // I can do that here too but for speed let's stick to what we have or do a quick fetch.
    // Simplification: We remove "Total Students" or replace with something available. 
    // Let's replace "Students" with "Assignments" or similar if needed. 
    // Wait, "My Classes" covers assignments.
    // Let's keep it 3 stats or 4 with placeholder for now to match layout.

    const quickActions = [
        {
            title: "Take Attendance",
            desc: "Mark student attendance",
            icon: "checkmark-circle",
            path: "/(teacher)/attendance",
            color: "bg-blue-500",
        },
        {
            title: "My Schedule",
            desc: "View weekly timetable",
            icon: "calendar",
            path: "/(teacher)/schedule",
            color: "bg-purple-500",
        },
        {
            title: "Assessments",
            desc: "Manage exams and grades",
            icon: "clipboard",
            path: "/(teacher)/assessments",
            color: "bg-orange-500",
        },
    ];

    if (loading) {
        return (
            <View className={`flex-1 items-center justify-center ${isDark ? "bg-dark-background" : "bg-background"}`}>
                <ActivityIndicator size="large" color={isDark ? "#4C8DFF" : "#2563EB"} />
            </View>
        );
    }

    return (
        <View className="flex-1 flex-row bg-slate-50 dark:bg-[#0f172a]">
            {/* ================= MAIN CONTENT ================= */}
            <View className="flex-1">

                {/* Header */}
                <View
                    className="px-8 py-5 border-b flex-row justify-between items-center backdrop-blur-md sticky top-0 z-50 bg-white/80 border-slate-200 dark:bg-[#0f172a]/80 dark:border-slate-800"
                >
                    <View>
                        <Text
                            className="text-2xl font-bold text-slate-900 dark:text-white"
                        >
                            Teacher Dashboard
                        </Text>
                        <Text className="text-slate-500 dark:text-slate-400">
                            Welcome back, {user?.name}
                        </Text>
                    </View>

                    <View className="flex-row items-center gap-4">
                        <View className="flex-row items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                            <Link href="/(teacher)/profile" className="w-10 h-10 flex rounded-full bg-indigo-500 items-center justify-center">
                                <Ionicons name="person" size={24} color="white" />
                            </Link>
                        </View>
                    </View>
                </View>

                {/* Scrollable Content */}
                <ScrollView className="flex-1 p-8" contentContainerStyle={{ paddingBottom: 50 }}>

                    <Animated.View entering={FadeInDown.duration(600).springify()}>
                        {/* Stats Grid */}
                        <Text className="text-lg font-bold mb-6 text-slate-900 dark:text-white">Overview</Text>
                        <View className="flex-row flex-wrap gap-6 mb-10">
                            {stats.map((stat, i) => (
                                <WebStatCard
                                    key={i}
                                    {...stat}
                                />
                            ))}
                        </View>

                        {/* Quick Actions & Recent Activity Layout */}
                        <View className="flex-row flex-wrap gap-8">

                            {/* Left Column: Quick Actions */}
                            <View className="flex-[2] min-w-[300px]">
                                <Text className="text-lg font-bold mb-6 text-slate-900 dark:text-white">Quick Actions</Text>
                                <View className="flex-row flex-wrap gap-4">
                                    {quickActions.map((action, i) => (
                                        <TouchableOpacity
                                            key={i}
                                            onPress={() => router.push(action.path as any)}
                                            className="w-full md:w-[48%] p-5 rounded-2xl border bg-white border-slate-100 dark:bg-[#1e293b] dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
                                        >
                                            <View className={`w-12 h-12 rounded-xl ${action.color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                                <Ionicons name={action.icon as any} size={24} className="text-slate-700 dark:text-white" />
                                            </View>
                                            <Text className="font-bold text-lg mb-1 text-slate-900 dark:text-white">{action.title}</Text>
                                            <Text className="text-sm text-slate-500 dark:text-slate-400">{action.desc}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Right Column: Recent Activity (Attendance History) */}
                            <View className="flex-1 min-w-[300px]">
                                <Text className="text-lg font-bold mb-6 text-slate-900 dark:text-white">Recent Activity</Text>
                                <View className="p-6 rounded-2xl border bg-white border-slate-100 dark:bg-[#1e293b] dark:border-slate-800">
                                    <View className="gap-6">
                                        {attendanceHistory.length > 0 ? (
                                            attendanceHistory.slice(0, 5).map((item, index) => (
                                                <View key={item.$id} className={`flex-row justify-between items-center ${index !== attendanceHistory.length - 1 && index < 4 ? 'pb-4 border-b border-slate-100 dark:border-slate-800' : ''}`}>
                                                    <View className="flex-row items-center gap-3">
                                                        <View className="w-2 h-2 rounded-full bg-emerald-500" />
                                                        <View>
                                                            <Text className="text-slate-600 dark:text-slate-300 font-medium">
                                                                Attendance Taken
                                                            </Text>
                                                            <Text className="text-xs text-slate-400 dark:text-slate-500">
                                                                {item.subject?.name} • {new Date(item.date).toLocaleDateString()}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            ))
                                        ) : (
                                            <Text className="text-slate-500 dark:text-slate-400">No recent activity</Text>
                                        )}
                                    </View>
                                </View>
                            </View>

                        </View>

                    </Animated.View>

                </ScrollView>

            </View>
        </View>
    );
}
