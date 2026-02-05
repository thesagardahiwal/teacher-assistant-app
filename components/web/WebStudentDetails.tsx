import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { PhoneDisplay } from "@/components/common/PhoneDisplay";

interface WebStudentDetailsProps {
    student: any;
    stats: {
        averageScore: string;
        totalAssessments: number;
    };
    results: any[];
    onEdit?: () => void;
    invitationLink?: string;
    onCopyInvite?: () => void;
}

export default function WebStudentDetails({
    student,
    stats,
    results,
    onEdit,
    invitationLink,
    onCopyInvite
}: WebStudentDetailsProps) {

    if (!student) return null;

    const processedResults = results.map(result => {
        const percentage = result.obtainedMarks && result.totalMarks
            ? (result.obtainedMarks / result.totalMarks) * 100
            : 0;
        const isPass = percentage >= 35;
        return {
            ...result,
            percentage,
            isPass
        };
    });

    return (
        <ScrollView className="flex-1 bg-background dark:bg-dark-background">
            <View className="flex-1 flex-col lg:flex-row gap-6 p-6">

                {/* LEFT COLUMN: Profile */}
                <View className="w-full lg:w-1/3 lg:min-w-[340px] space-y-4">

                    {/* Profile Card */}
                    <Animated.View
                        entering={FadeInDown.duration(500)}
                        className="rounded-xl bg-card dark:bg-dark-card border border-border dark:border-dark-border shadow-sm overflow-hidden"
                    >
                        <View className="p-6 border-b border-border dark:border-dark-border bg-gradient-to-r from-primary/5 to-transparent dark:from-primary/10">
                            <View className="flex-row items-center justify-between">
                                <View>
                                    <Text className="text-xs font-medium text-textSecondary dark:text-dark-textSecondary uppercase tracking-wide mb-1">
                                        Student Profile
                                    </Text>
                                    <Text className="text-lg font-semibold text-textPrimary dark:text-dark-textPrimary">
                                        {student.name}
                                    </Text>
                                </View>
                                <View className="px-3 py-1 rounded-md bg-primary/10">
                                    <Text className="text-xs font-medium text-primary">Student</Text>
                                </View>
                            </View>
                        </View>

                        <View className="p-6">
                            <View className="flex items-center mb-6">
                                <View className="w-24 h-24 rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center mb-4 border-2 border-white dark:border-dark-card shadow">
                                    <Text className="text-3xl font-semibold text-secondary dark:text-secondary">
                                        {student.name?.charAt(0).toUpperCase()}
                                    </Text>
                                </View>

                                <Text className="text-sm font-medium text-textPrimary dark:text-dark-textPrimary mb-2">
                                    {student.email || "No Email"}
                                </Text>

                                <View className="flex-row gap-2 flex-wrap justify-center mb-4">
                                    <View className="px-3 py-1.5 rounded-md bg-primary/5 border border-primary/10">
                                        <Text className="text-xs font-medium text-primary">
                                            Roll No: {student.rollNumber}
                                        </Text>
                                    </View>
                                    {student.class?.name && (
                                        <View className="px-3 py-1.5 rounded-md bg-secondary/5 border border-secondary/10">
                                            <Text className="text-xs font-medium text-secondary">
                                                {student.class.name}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {student.phone && (
                                <View className="mb-6">
                                    <PhoneDisplay phone={student.phone} className="text-sm" />
                                </View>
                            )}

                            {onEdit && (
                                <TouchableOpacity
                                    onPress={onEdit}
                                    className="w-full py-2.5 rounded-lg bg-primary hover:opacity-90 flex-row items-center justify-center gap-2"
                                >
                                    <Ionicons name="create-outline" size={16} color="white" />
                                    <Text className="text-white font-medium text-sm">Edit Student</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </Animated.View>

                    {/* Invitation Status */}
                    {invitationLink && !student.isActive && (
                        <Animated.View
                            entering={FadeInDown.delay(100).duration(500)}
                            className="rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 overflow-hidden"
                        >
                            <View className="p-4">
                                <View className="flex-row items-center gap-3 mb-3">
                                    <View className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                        <Ionicons name="mail-unread-outline" size={16} color="#1A73E8" />
                                    </View>
                                    <View>
                                        <Text className="font-medium text-sm text-primary">
                                            Pending Invitation
                                        </Text>
                                        <Text className="text-xs text-textSecondary">
                                            Student has not joined yet
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={onCopyInvite}
                                    className="w-full py-2 rounded-lg bg-primary hover:opacity-90 flex-row items-center justify-center gap-2"
                                >
                                    <Ionicons name="copy-outline" size={14} color="white" />
                                    <Text className="text-white font-medium text-xs">Copy Invite Link</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    )}

                    {/* Student Info Card */}
                    <Animated.View
                        entering={FadeInDown.delay(150).duration(500)}
                        className="rounded-xl bg-card dark:bg-dark-card border border-border dark:border-dark-border overflow-hidden"
                    >
                        <View className="p-4 border-b border-border dark:border-dark-border">
                            <Text className="font-medium text-sm text-textPrimary dark:text-dark-textPrimary">
                                Student Information
                            </Text>
                        </View>
                        <View className="p-4 space-y-3">
                            {student.fatherName && (
                                <View className="flex items-start">
                                    <Text className="text-xs text-textSecondary dark:text-dark-textSecondary mb-1">Parent</Text>
                                    <Text className="text-sm font-medium text-textPrimary dark:text-dark-textPrimary">
                                        {student.fatherName}
                                    </Text>
                                </View>
                            )}
                            {student.bloodGroup && (
                                <View className="flex items-start">
                                    <Text className="text-xs text-textSecondary dark:text-dark-textSecondary mb-1">Blood Group</Text>
                                    <View className="px-2 py-1 rounded bg-error/10">
                                        <Text className="text-xs font-medium text-error">
                                            {student.bloodGroup}
                                        </Text>
                                    </View>
                                </View>
                            )}
                            {student.admissionDate && (
                                <View className="flex items-start">
                                    <Text className="text-xs text-textSecondary dark:text-dark-textSecondary mb-1">Admission Date</Text>
                                    <Text className="text-sm font-medium text-textPrimary dark:text-dark-textPrimary">
                                        {student.admissionDate}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </Animated.View>
                </View>

                {/* RIGHT COLUMN: Results & Stats */}
                <View className="flex-1 min-w-0">
                    <div className="space-y-6">

                        {/* Stats Overview */}
                        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-base font-semibold text-textPrimary dark:text-dark-textPrimary">
                                        Performance Overview
                                    </h3>
                                    <p className="text-xs text-textSecondary dark:text-dark-textSecondary mt-0.5">
                                        Current academic performance
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    {
                                        label: "Average Score",
                                        value: `${stats.averageScore || "0"}%`,
                                        icon: "trophy-outline",
                                        color: "text-warning",
                                        bg: "bg-warning/10",
                                        border: "border-warning/20"
                                    },
                                    {
                                        label: "Total Assessments",
                                        value: stats.totalAssessments || 0,
                                        icon: "document-text-outline",
                                        color: "text-primary",
                                        bg: "bg-primary/10",
                                        border: "border-primary/20"
                                    },
                                    {
                                        label: "Current Standing",
                                        value: parseFloat(stats.averageScore) >= 35 ? "Good" : "Needs Improvement",
                                        icon: "school-outline",
                                        color: parseFloat(stats.averageScore) >= 35 ? "text-success" : "text-error",
                                        bg: parseFloat(stats.averageScore) >= 35 ? "bg-success/10" : "bg-error/10",
                                        border: parseFloat(stats.averageScore) >= 35 ? "border-success/20" : "border-error/20"
                                    },
                                ].map((stat, i) => (
                                    <div
                                        key={i}
                                        className="rounded-lg bg-card dark:bg-dark-card border border-border dark:border-dark-border p-4 hover:border-primary/30 transition-colors"
                                    >
                                        <div className={`w-10 h-10 rounded-lg ${stat.bg} border ${stat.border} flex items-center justify-center mb-3`}>
                                            <Ionicons name={stat.icon as any} size={20} className={stat.color} />
                                        </div>
                                        <div className="text-2xl font-semibold text-textPrimary dark:text-dark-textPrimary mb-1">
                                            {stat.value}
                                        </div>
                                        <div className="text-sm font-medium text-textPrimary dark:text-dark-textPrimary">
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Animated.View>

                        {/* Recent Results Table */}
                        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-base font-semibold text-textPrimary dark:text-dark-textPrimary">
                                        Recent Results
                                    </h3>
                                    <p className="text-xs text-textSecondary dark:text-dark-textSecondary mt-0.5">
                                        Latest assessment performances
                                    </p>
                                </div>
                                {results.length > 0 && (
                                    <div className="px-3 py-1 rounded-md bg-background dark:bg-dark-background border border-border dark:border-dark-border">
                                        <span className="text-xs font-medium text-textSecondary dark:text-dark-textSecondary">
                                            {results.length} assessments
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="rounded-lg border border-border dark:border-dark-border bg-card dark:bg-dark-card overflow-hidden">
                                {/* Table Header */}
                                <div className="grid grid-cols-12 gap-4 p-4 bg-background dark:bg-dark-background border-b border-border dark:border-dark-border">
                                    <div className="col-span-6">
                                        <span className="text-xs font-medium text-textSecondary dark:text-dark-textSecondary uppercase tracking-wide">
                                            Assessment
                                        </span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-xs font-medium text-textSecondary dark:text-dark-textSecondary uppercase tracking-wide">
                                            Score
                                        </span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-xs font-medium text-textSecondary dark:text-dark-textSecondary uppercase tracking-wide">
                                            Percentage
                                        </span>
                                    </div>
                                    <div className="col-span-2 text-right">
                                        <span className="text-xs font-medium text-textSecondary dark:text-dark-textSecondary uppercase tracking-wide">
                                            Status
                                        </span>
                                    </div>
                                </div>

                                {/* Table Rows */}
                                {processedResults.length > 0 ? (
                                    <div className="divide-y divide-border dark:divide-dark-border">
                                        {processedResults.map((result, i) => (
                                            <div
                                                key={i}
                                                className="grid grid-cols-12 gap-4 p-4 hover:bg-background/50 dark:hover:bg-dark-background/50 transition-colors"
                                            >
                                                <div className="col-span-6">
                                                    <div className="text-sm font-medium text-textPrimary dark:text-dark-textPrimary mb-1">
                                                        {result.assessment?.title || "Assessment"}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs text-textSecondary dark:text-dark-textSecondary">
                                                            {result.assessment?.subject?.name || result.subject || "Subject"}
                                                        </span>
                                                        {result.date && (
                                                            <span className="text-xs text-muted dark:text-dark-muted">
                                                                {result.date}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-span-2">
                                                    {result.obtainedMarks !== undefined && result.totalMarks !== undefined ? (
                                                        <>
                                                            <div className="text-sm font-medium text-textPrimary dark:text-dark-textPrimary">
                                                                {result.obtainedMarks}/{result.totalMarks}
                                                            </div>
                                                            <div className="text-xs text-textSecondary dark:text-dark-textSecondary mt-0.5">
                                                                Max: {result.totalMarks}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span className="text-sm text-textSecondary dark:text-dark-textSecondary">
                                                            -
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="col-span-2">
                                                    {result.percentage !== undefined ? (
                                                        <span className={`text-sm font-semibold ${result.isPass ? 'text-success' : 'text-error'}`}>
                                                            {result.percentage.toFixed(1)}%
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-textSecondary dark:text-dark-textSecondary">
                                                            -
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="col-span-2 text-right">
                                                    {result.percentage !== undefined ? (
                                                        <div className={`inline-flex px-2.5 py-1 rounded-md ${result.isPass
                                                            ? 'bg-success/10 border border-success/20'
                                                            : 'bg-error/10 border border-error/20'
                                                            }`}>
                                                            <span className={`text-xs font-medium ${result.isPass
                                                                ? 'text-success'
                                                                : 'text-error'
                                                                }`}>
                                                                {result.isPass ? "PASS" : "FAIL"}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-textSecondary dark:text-dark-textSecondary">
                                                            Pending
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center">
                                        <Ionicons name="document-text-outline" size={32} color="#94A3B8" className="mx-auto mb-3" />
                                        <div className="text-sm font-medium text-textSecondary dark:text-dark-textSecondary mb-1">
                                            No results available
                                        </div>
                                        <div className="text-xs text-muted dark:text-dark-muted">
                                            Assessment results will appear here once completed
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Animated.View>

                    </div>
                </View>
            </View>
        </ScrollView>
    );
}