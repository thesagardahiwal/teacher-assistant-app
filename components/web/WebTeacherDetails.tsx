import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { PhoneDisplay } from "@/components/common/PhoneDisplay";

interface WebTeacherDetailsProps {
    teacher: any;
    stats: {
        subjects: number;
        lectures: number;
        classes: number;
        assessments: number;
    };
    assignments: any[];
    schedules: any[];
    attendanceStats?: {
        totalSessions: number;
        classes: string[];
    };
    onEdit?: () => void;
    invitationLink?: string;
    onCopyInvite?: () => void;
}

export default function WebTeacherDetails({
    teacher,
    stats,
    assignments,
    schedules,
    attendanceStats,
    onEdit,
    invitationLink,
    onCopyInvite,
}: WebTeacherDetailsProps) {

    if (!teacher) return null;

    // Helper for Workload Chart
    const lecturesPerDay = schedules.reduce((acc, curr) => {
        const day = curr.dayOfWeek?.substring(0, 3).toUpperCase() || "OTH";
        acc[day] = (acc[day] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Calculate max lectures for bar height
    const lectureCounts = Object.values(lecturesPerDay) as number[];
    const maxLectures = Math.max(...lectureCounts, 1);
    const totalLectures = lectureCounts.reduce((a, b) => a + b, 0);

    return (
        <ScrollView className="flex-1 bg-background dark:bg-dark-background">
            <View className="flex-1 flex-col lg:flex-row gap-6 p-6 lg:p-8">

                {/* LEFT COLUMN: Profile & Key Info */}
                <View className="w-full lg:w-1/3 lg:min-w-[350px] gap-6">

                    {/* Profile Card - Enhanced */}
                    <Animated.View
                        entering={FadeInDown.duration(600).springify()}
                        className="p-6 rounded-2xl bg-card dark:bg-dark-card border border-border dark:border-dark-border shadow-sm"
                    >
                        <View className="items-center mb-6">
                            <View className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 items-center justify-center mb-4 border-4 border-white dark:border-dark-card shadow-md">
                                <Text className="text-4xl font-bold text-primary dark:text-primary">
                                    {teacher.name?.charAt(0).toUpperCase()}
                                </Text>
                            </View>

                            <Text className="text-2xl font-bold mb-1 text-textPrimary dark:text-dark-textPrimary text-center">
                                {teacher.name}
                            </Text>
                            <Text className="text-base mb-4 text-textSecondary dark:text-dark-textSecondary text-center">
                                {teacher.email}
                            </Text>

                            <View className="flex-row gap-2 flex-wrap justify-center mb-6">
                                <View className="px-3 py-1.5 rounded-full bg-primary/10 dark:bg-primary/20">
                                    <Text className="text-sm font-semibold text-primary dark:text-primary">
                                        {teacher.role}
                                    </Text>
                                </View>
                                {teacher.department && (
                                    <View className="px-3 py-1.5 rounded-full bg-secondary/10 dark:bg-secondary/20">
                                        <Text className="text-sm font-semibold text-secondary dark:text-secondary">
                                            {teacher.department}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {teacher.phone && (
                            <View className="mb-6">
                                <PhoneDisplay phone={teacher.phone} className="text-center" />
                            </View>
                        )}

                        {onEdit && (
                            <TouchableOpacity
                                onPress={onEdit}
                                className="w-full py-3 rounded-xl bg-primary hover:bg-primaryHover items-center flex-row justify-center gap-2"
                            >
                                <Ionicons name="create-outline" size={18} color="white" />
                                <Text className="text-white font-semibold">Edit Profile</Text>
                            </TouchableOpacity>
                        )}
                    </Animated.View>

                    {/* Invitation Status - Enhanced */}
                    {invitationLink && !teacher.isActive && (
                        <Animated.View
                            entering={FadeInDown.delay(100).duration(600).springify()}
                            className="p-5 rounded-2xl border border-primary/20 bg-primary/5 dark:bg-primary/10"
                        >
                            <View className="flex-row items-center gap-3 mb-3">
                                <Ionicons name="mail-unread-outline" size={22} color="#1A73E8" />
                                <View>
                                    <Text className="font-bold text-lg text-primary dark:text-primary">
                                        Pending Invitation
                                    </Text>
                                    <Text className="text-sm text-textSecondary dark:text-dark-textSecondary">
                                        Account not yet activated
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={onCopyInvite}
                                className="bg-primary hover:bg-primaryHover py-2.5 rounded-xl items-center flex-row justify-center gap-2"
                            >
                                <Ionicons name="copy-outline" size={18} color="white" />
                                <Text className="text-white font-semibold">Copy Invite Link</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}
                </View>

                {/* RIGHT COLUMN: Stats & Details */}
                <View className="flex-1">
                    <View className="gap-6 pb-10">

                        {/* Stats Grid - Enhanced */}
                        <Animated.View entering={FadeInDown.delay(200).duration(600).springify()}>
                            <Text className="text-xl font-bold mb-4 text-textPrimary dark:text-dark-textPrimary">
                                Academic Overview
                            </Text>
                            <View className="flex-row flex-wrap gap-4">
                                {[
                                    {
                                        label: "Subjects",
                                        value: stats.subjects,
                                        icon: "book-outline",
                                        color: "text-primary",
                                        bg: "bg-primary/10",
                                        border: "border-primary/20"
                                    },
                                    {
                                        label: "Lectures/Week",
                                        value: stats.lectures,
                                        icon: "easel-outline",
                                        color: "text-secondary",
                                        bg: "bg-secondary/10",
                                        border: "border-secondary/20"
                                    },
                                    {
                                        label: "Classes",
                                        value: stats.classes,
                                        icon: "people-outline",
                                        color: "text-success",
                                        bg: "bg-success/10",
                                        border: "border-success/20"
                                    },
                                    {
                                        label: "Assessments",
                                        value: stats.assessments,
                                        icon: "clipboard-outline",
                                        color: "text-warning",
                                        bg: "bg-warning/10",
                                        border: "border-warning/20"
                                    },
                                ].map((stat, i) => (
                                    <View
                                        key={i}
                                        className="flex-1 min-w-[160px] p-5 rounded-2xl bg-card dark:bg-dark-card border border-border dark:border-dark-border"
                                    >
                                        <View className={`w-12 h-12 rounded-xl ${stat.bg} border ${stat.border} items-center justify-center mb-3`}>
                                            <Ionicons name={stat.icon as any} size={24} className={stat.color} />
                                        </View>
                                        <Text className="text-3xl font-bold text-textPrimary dark:text-dark-textPrimary">
                                            {stat.value}
                                        </Text>
                                        <Text className="text-sm font-medium text-textSecondary dark:text-dark-textSecondary">
                                            {stat.label}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </Animated.View>

                        {/* Workload - Enhanced with visual bars */}
                        <Animated.View entering={FadeInDown.delay(300).duration(600).springify()}>
                            <Text className="text-xl font-bold mb-4 text-textPrimary dark:text-dark-textPrimary">
                                Weekly Workload
                            </Text>
                            <View className="p-5 rounded-2xl bg-card dark:bg-dark-card border border-border dark:border-dark-border">
                                <View className="flex-row justify-between items-end mb-4" style={{ height: 100 }}>
                                    {["MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => {
                                        const lectures = lecturesPerDay[day] || 0;
                                        const heightPercentage = (lectures / maxLectures) * 80;

                                        return (
                                            <View key={day} className="flex-1 items-center justify-end">
                                                <View
                                                    className={`w-10 rounded-t-lg mb-2 ${lectures > 0
                                                        ? 'bg-gradient-to-t from-primary to-primaryHover'
                                                        : 'bg-border dark:bg-dark-border'
                                                        }`}
                                                    style={{ height: `${heightPercentage}%` }}
                                                />
                                                <Text className="text-xs font-semibold text-textSecondary dark:text-dark-textSecondary">
                                                    {day}
                                                </Text>
                                                <Text className={`text-sm font-bold mt-1 ${lectures > 0
                                                    ? 'text-primary dark:text-primary'
                                                    : 'text-textSecondary dark:text-dark-textSecondary'
                                                    }`}>
                                                    {lectures || "0"}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>
                                <Text className="text-sm text-textSecondary dark:text-dark-textSecondary text-center">
                                    {totalLectures} total weekly lectures
                                </Text>
                            </View>
                        </Animated.View>

                        {/* Assignments Table - Enhanced */}
                        <Animated.View entering={FadeInDown.delay(400).duration(600).springify()}>
                            <Text className="text-xl font-bold mb-4 text-textPrimary dark:text-dark-textPrimary">
                                Assigned Classes
                            </Text>
                            <View className="rounded-2xl border border-border dark:border-dark-border overflow-hidden bg-card dark:bg-dark-card">
                                {/* Table Header */}
                                <View className="flex-row p-4 bg-background dark:bg-dark-background border-b border-border dark:border-dark-border">
                                    <Text className="flex-1 font-semibold text-textSecondary dark:text-dark-textSecondary">
                                        Subject
                                    </Text>
                                    <Text className="flex-1 font-semibold text-textSecondary dark:text-dark-textSecondary">
                                        Class
                                    </Text>
                                    <Text className="w-24 font-semibold text-textSecondary dark:text-dark-textSecondary text-right">
                                        Schedule
                                    </Text>
                                </View>

                                {/* Table Rows */}
                                {assignments.length > 0 ? (
                                    assignments.map((assign, i) => (
                                        <View
                                            key={i}
                                            className="flex-row p-4 border-b last:border-b-0 border-border/50 dark:border-dark-border/50 hover:bg-background/50 dark:hover:bg-dark-background/50"
                                        >
                                            <View className="flex-1">
                                                <Text className="font-medium text-textPrimary dark:text-dark-textPrimary">
                                                    {assign.subject}
                                                </Text>
                                                {assign.subjectCode && (
                                                    <Text className="text-sm text-textSecondary dark:text-dark-textSecondary mt-1">
                                                        {assign.subjectCode}
                                                    </Text>
                                                )}
                                            </View>
                                            <View className="flex-1">
                                                <Text className="font-medium text-textPrimary dark:text-dark-textPrimary">
                                                    {assign.class}
                                                </Text>
                                                {assign.section && (
                                                    <Text className="text-sm text-textSecondary dark:text-dark-textSecondary mt-1">
                                                        Section {assign.section}
                                                    </Text>
                                                )}
                                            </View>
                                            <View className="w-24">
                                                <View className="px-3 py-1 rounded-full bg-primary/10 dark:bg-primary/20 items-center self-start ml-auto">
                                                    <Text className="text-xs font-semibold text-primary dark:text-primary">
                                                        {assign.schedule || "MWF"}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <View className="p-8 items-center justify-center">
                                        <Ionicons name="school-outline" size={48} color="#94A3B8" className="mb-3" />
                                        <Text className="text-textSecondary dark:text-dark-textSecondary">
                                            No classes assigned
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </Animated.View>

                    </View>
                </View>
            </View>
        </ScrollView>
    );
}