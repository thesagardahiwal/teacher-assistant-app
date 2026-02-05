import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useAuth } from "@/store/hooks/useAuth";
import { useClasses } from "@/store/hooks/useClasses";
import { useCourses } from "@/store/hooks/useCourses";
import { useStudents } from "@/store/hooks/useStudents";
import { useTeachers } from "@/store/hooks/useTeachers";
import { institutionStorage } from "@/utils/institutionStorage";


// STAT CARD COMPONENT
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

export default function WebAdminDashboard() {
    const router = useRouter();
    const { user } = useAuth();
    const { data: courses, fetchCourses } = useCourses();
    const { data: classes, fetchClasses } = useClasses();
    const { data: teachers, fetchTeachers } = useTeachers();
    const { data: students, fetchStudents } = useStudents();

    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const institutionId =
                typeof user?.institution === "string"
                    ? user?.institution
                    : user?.institution?.$id ||
                    (await institutionStorage.getInstitutionId());

            if (institutionId) {
                await Promise.all([
                    fetchCourses(institutionId),
                    fetchClasses(institutionId),
                    fetchTeachers(institutionId),
                    fetchStudents(institutionId),
                ]);
            }
            setIsLoadingData(false);
        };
        loadData();
    }, [user]);

    const stats = [
        {
            label: "Total Students",
            value: students?.length || 0,
            icon: "school",
            gradient: "bg-blue-500",
        },
        {
            label: "Total Teachers",
            value: teachers?.length || 0,
            icon: "easel",
            gradient: "bg-purple-500",
        },
        {
            label: "Active Classes",
            value: classes?.length || 0,
            icon: "people",
            gradient: "bg-orange-500",
        },
        {
            label: "Courses",
            value: courses?.length || 0,
            icon: "book",
            gradient: "bg-emerald-500",
        },
    ];

    const quickActions = [
        {
            title: "Add Student",
            desc: "Register new student",
            icon: "person-add",
            path: "/(admin)/students/create",
            color: "bg-blue-500",
        },
        {
            title: "Add Teacher",
            desc: "Onboard new faculty",
            icon: "briefcase",
            path: "/(admin)/teachers/create",
            color: "bg-purple-500",
        },
        {
            title: "Create Class",
            desc: "Setup new classroom",
            icon: "calendar",
            path: "/(admin)/classes/create",
            color: "bg-orange-500",
        },
        {
            title: "Create Course",
            desc: "Add new curriculum",
            icon: "library",
            path: "/(admin)/courses/create",
            color: "bg-emerald-500",
        },
    ];

    /* Sidebar links handled by global Layout */
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
                            Dashboard
                        </Text>
                        <Text className="text-slate-500 dark:text-slate-400">
                            Welcome back, {user?.name}
                        </Text>
                    </View>

                    <View className="flex-row items-center gap-4">

                        <View className="flex-row items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                            <Link href="/(admin)/profile" className="w-10 h-10 flex rounded-full bg-indigo-500 items-center justify-center">
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

                            {/* Right Column: Recent / System Status */}
                            <View className="flex-1 min-w-[300px]">
                                <Text className="text-lg font-bold mb-6 text-slate-900 dark:text-white">System Status</Text>
                                <View className="p-6 rounded-2xl border bg-white border-slate-100 dark:bg-[#1e293b] dark:border-slate-800">
                                    <View className="gap-6">
                                        <View className="flex-row justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                                            <View className="flex-row items-center gap-3">
                                                <View className="w-2 h-2 rounded-full bg-emerald-500" />
                                                <Text className="text-slate-600 dark:text-slate-300">Database</Text>
                                            </View>
                                            <Text className="text-emerald-500 font-medium text-sm">Operational</Text>
                                        </View>
                                        <View className="flex-row justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                                            <View className="flex-row items-center gap-3">
                                                <View className="w-2 h-2 rounded-full bg-emerald-500" />
                                                <Text className="text-slate-600 dark:text-slate-300">API Gateway</Text>
                                            </View>
                                            <Text className="text-emerald-500 font-medium text-sm">Operational</Text>
                                        </View>
                                        <View className="flex-row justify-between items-center">
                                            <View className="flex-row items-center gap-3">
                                                <View className="w-2 h-2 rounded-full bg-blue-500" />
                                                <Text className="text-slate-600 dark:text-slate-300">Last Sync</Text>
                                            </View>
                                            <Text className="text-slate-500 dark:text-slate-400">Just now</Text>
                                        </View>
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
