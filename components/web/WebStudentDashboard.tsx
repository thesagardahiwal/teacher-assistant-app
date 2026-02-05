import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { academicYearService } from "@/services/academicYear.service";
import { attendanceRecordService } from "@/services/attendanceRecord.service";
import { useAuth } from "@/store/hooks/useAuth";
import { useTheme } from "@/store/hooks/useTheme";
import { AttendanceRecord } from "@/types";
import { ResponsiveContainer } from "../ui/ResponsiveContainer";

// STAT CARD COMPONENT
const WebStatCard = ({
    label,
    value,
    icon,
    gradient,
    suffix = ""
}: {
    label: string;
    value: string | number;
    icon: any;
    gradient: string;
    suffix?: string;
}) => (
    <View
        className="flex-1 min-w-[240px] p-5 rounded-2xl border bg-white border-slate-200 dark:bg-[#1e293b] dark:border-slate-700 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
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

        <View className="flex-row items-baseline">
            <Text
                className="text-3xl font-bold mb-1 text-slate-900 dark:text-white"
            >
                {value}
            </Text>
            {suffix ? <Text className="ml-1 text-lg text-slate-500">{suffix}</Text> : null}
        </View>
        <Text className="text-sm text-slate-500 dark:text-slate-400">
            {label}
        </Text>
    </View>
);

export default function WebStudentDashboard() {
    const router = useRouter();
    const { user } = useAuth();
    const { isDark } = useTheme();
    const { width } = useWindowDimensions();
    const isMobile = width < 768;

    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [stats, setStats] = useState({ present: 0, absent: 0, total: 0, percentage: 0 });

    const fetchAttendance = async () => {
        try {
            console.log("Fetching attendance for user:", user?.$id);
            if (!user?.$id) return;

            const institutionId = typeof user.institution === 'string' ? user.institution : user.institution.$id;
            console.log("Institution ID:", institutionId);

            // Fetch Academic Years to find current
            const yearsRes = await academicYearService.list(institutionId);
            const currentYear = yearsRes.documents.find(y => y.isCurrent);
            console.log("Current Academic Year:", currentYear);

            const res = await attendanceRecordService.listByStudent(user.$id);
            console.log("Raw Attendance Records:", res.documents.length);

            // Filter by Current Academic Year
            const allRecords = res.documents.filter(r => {
                if (!currentYear) {
                    console.log("No current year found, including record by default");
                    return true;
                }
                const rYear = r.attendance?.class?.academicYear;
                const rYearId = typeof rYear === 'string' ? rYear : rYear?.$id;
                console.log(`Record ${r.$id} Year ID:`, rYearId, "Current Year ID:", currentYear.$id);
                return rYearId === currentYear.$id;
            });

            console.log("Filtered Records Count:", allRecords.length);

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
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, [user?.$id]);

    const statItems = [
        {
            label: "Attendance Score",
            value: stats.percentage,
            suffix: "%",
            icon: "pie-chart-outline",
            gradient: "bg-blue-500",
        },
        {
            label: "Present",
            value: stats.present,
            icon: "checkmark-circle-outline",
            gradient: "bg-emerald-500",
        },
        {
            label: "Absent",
            value: stats.absent,
            icon: "close-circle-outline",
            gradient: "bg-red-500",
        },
        {
            label: "Total Sessions",
            value: stats.total,
            icon: "calendar-outline",
            gradient: "bg-purple-500",
        },
    ];

    const quickActions = [
        {
            title: "My Results",
            desc: "Check your grades",
            icon: "school",
            path: "/(student)/assessments",
            color: "bg-indigo-500",
        },
        {
            title: "Calendar",
            desc: "View schedules",
            icon: "calendar",
            path: "/(student)/calendar",
            color: "bg-purple-500",
        },
        {
            title: "Teachers",
            desc: "Faculty info",
            icon: "people",
            path: "/(student)/teachers",
            color: "bg-teal-500",
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
                            Student Dashboard
                        </Text>
                        <Text className="text-slate-500 dark:text-slate-400">
                            Welcome back, {user?.name}
                        </Text>
                    </View>

                    <View className="flex-row items-center gap-4">
                        <View className="flex-row items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                            <Link href="/(student)/profile" className="w-10 h-10 flex rounded-full bg-blue-600 items-center justify-center">
                                <Ionicons name="person" size={24} color="white" />
                            </Link>
                        </View>
                    </View>
                </View>

                {/* Scrollable Content */}
                <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 50 }}>
                    <ResponsiveContainer className="p-8">
                        <Animated.View entering={FadeInDown.duration(600).springify()}>
                            {/* Stats Grid */}
                            <Text className="text-lg font-bold mb-6 text-slate-900 dark:text-white">Overview</Text>
                            <View className="flex-row flex-wrap gap-6 mb-10">
                                {statItems.map((stat, i) => (
                                    <WebStatCard
                                        key={i}
                                        {...stat}
                                    />
                                ))}
                            </View>

                            {/* Quick Actions & Recent Activity Layout */}
                            <View className={`flex-row gap-8 ${isMobile ? 'flex-wrap' : ''}`}>

                                {/* Left Column: Quick Actions */}
                                <View className={`min-w-[300px] ${isMobile ? 'w-full' : 'flex-[2]'}`}>
                                    <Text className="text-lg font-bold mb-6 text-slate-900 dark:text-white">Quick Actions</Text>
                                    <View className="flex-row flex-wrap gap-4">
                                        {quickActions.map((action, i) => (
                                            <TouchableOpacity
                                                key={i}
                                                onPress={() => router.push(action.path as any)}
                                                className={`p-5 rounded-2xl border bg-white border-slate-100 dark:bg-[#1e293b] dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group ${isMobile ? 'w-full' : 'w-[48%]'}`}
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
                                <View className={`min-w-[300px] ${isMobile ? 'w-full' : 'flex-1'}`}>
                                    <Text className="text-lg font-bold mb-6 text-slate-900 dark:text-white">Recent Activity</Text>
                                    <View className="p-6 rounded-2xl border bg-white border-slate-100 dark:bg-[#1e293b] dark:border-slate-800">
                                        <View className="gap-6">
                                            {records.length > 0 ? (
                                                records.slice(0, 5).map((item, index) => (
                                                    <View key={item.$id} className={`flex-row justify-between items-center ${index !== records.length - 1 && index < 4 ? 'pb-4 border-b border-slate-100 dark:border-slate-800' : ''}`}>
                                                        <View className="flex-row items-center gap-3">
                                                            <View className={`w-2 h-2 rounded-full ${item.present ? "bg-emerald-500" : "bg-red-500"}`} />
                                                            <View>
                                                                <Text className="text-slate-600 dark:text-slate-300 font-medium">
                                                                    {item.present ? "Present" : "Absent"}
                                                                </Text>
                                                                <Text className="text-xs text-slate-400 dark:text-slate-500">
                                                                    {item.attendance?.subject?.name} • {new Date(item.$createdAt).toLocaleDateString()}
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
                    </ResponsiveContainer>
                </ScrollView>

            </View>
        </View>
    );
}
