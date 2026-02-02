import { PhoneDisplay } from "@/components/common/PhoneDisplay";
import { useTheme } from "@/store/hooks/useTheme";
import { Student } from "@/types";
import { AssessmentResult } from "@/types/assessmentResult.type";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface StudentProfileViewProps {
    student: Student;
    stats?: {
        averageScore: string | number;
        totalAssessments: number;
    };
    results?: AssessmentResult[];
    children?: React.ReactNode;
}

export function StudentProfileView({
    student,
    stats,
    results = [],
    children
}: StudentProfileViewProps) {
    const { isDark } = useTheme();

    if (!student) return null;

    const SectionHeader = ({ title, icon }: any) => (
        <View className="flex-row items-center mb-4 mt-8">
            <View className={`p-2 rounded-lg mr-3 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                <MaterialCommunityIcons name={icon} size={20} color={isDark ? "#9CA3AF" : "#4B5563"} />
            </View>
            <Text className={`text-lg font-bold ${isDark ? "text-dark-textPrimary" : "text-textPrimary"}`}>{title}</Text>
        </View>
    );

    const StatCard = ({ label, value, colorClass, icon }: any) => (
        <View className={`flex-1 p-4 rounded-2xl border ${isDark ? "bg-dark-card border-dark-border" : `bg-${colorClass}-50 border-${colorClass}-100`} items-center mr-2 last:mr-0`}>
            <Text className={`text-3xl font-bold mb-1 ${isDark ? "text-white" : `text-${colorClass}-700`}`}>{value}</Text>
            <Text className={`text-xs ${isDark ? "text-gray-400" : `text-${colorClass}-600`}`}>{label}</Text>
        </View>
    );

    return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            {/* A. Header Card */}
            <Animated.View entering={FadeInDown.delay(100).springify()} className={`p-6 rounded-3xl mb-2 items-center ${isDark ? "bg-dark-card" : "bg-white"} shadow-sm mx-1 mt-1`}>
                <View className={`w-24 h-24 rounded-full items-center justify-center mb-4 border-4 ${isDark ? "bg-indigo-900/30 border-indigo-900/50" : "bg-indigo-50 border-white"} shadow-sm`}>
                    <Text className="text-4xl font-bold text-indigo-500">{student.name?.charAt(0)}</Text>
                </View>
                <Text className={`text-2xl font-bold mb-1 text-center ${isDark ? "text-dark-textPrimary" : "text-textPrimary"}`}>{student.name}</Text>
                <Text className={`text-sm mb-5 text-center ${isDark ? "text-dark-textSecondary" : "text-textSecondary"}`}>{student.email}</Text>

                <View className="flex-row gap-2 flex-wrap justify-center">
                    <View className={`px-4 py-1.5 rounded-full ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                        <Text className={`text-xs font-semibold ${isDark ? "text-gray-300" : "text-gray-600"}`}>Roll: {student.rollNumber}</Text>
                    </View>
                    <View className={`px-4 py-1.5 rounded-full ${isDark ? "bg-purple-900/30" : "bg-purple-50"}`}>
                        <Text className={`text-xs font-semibold ${isDark ? "text-purple-300" : "text-purple-700"}`}>{student.class?.name}</Text>
                    </View>
                    {student.course && (
                        <View className={`px-4 py-1.5 rounded-full ${isDark ? "bg-blue-900/30" : "bg-blue-50"}`}>
                            <Text className={`text-xs font-semibold ${isDark ? "text-blue-300" : "text-blue-700"}`}>{student.course.code}</Text>
                        </View>
                    )}
                </View>

                {student.phone && <PhoneDisplay phone={student.phone} className="mt-5" />}
            </Animated.View>

            {/* Custom Content (Edit Forms etc) */}
            {children && (
                <Animated.View entering={FadeInDown.delay(200).springify()} className="mb-2">
                    {children}
                </Animated.View>
            )}

            {/* B. Stats */}
            {stats && (
                <Animated.View entering={FadeInDown.delay(300).springify()} className="flex-row mb-2 gap-2 mx-1">
                    <StatCard label="Avg Score" value={`${stats.averageScore}%`} colorClass="blue" icon="analytics" />
                    <StatCard label="Assessments" value={stats.totalAssessments} colorClass="green" icon="document-text" />
                </Animated.View>
            )}

            {/* C. Results List */}
            <Animated.View entering={FadeInDown.delay(400).springify()}>
                <SectionHeader title="Recent Results" icon="clipboard-list-outline" />
                <View className="mx-1">
                    {results.map((item, idx) => (
                        <View key={item.$id || idx} className={`mb-3 p-4 rounded-xl border ${isDark ? "bg-dark-card border-dark-border" : "bg-white border-gray-100"}`}>
                            <View className="flex-row justify-between items-start mb-2">
                                <View className="flex-1">
                                    <Text className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>
                                        {item.assessment?.title || "Assessment"}
                                    </Text>
                                    <Text className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                        {item.assessment?.subject?.name}
                                    </Text>
                                </View>
                                <View className={`px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg`}>
                                    <Text className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                                        {item.obtainedMarks} <Text className="text-gray-400 text-xs">/ {item.totalMarks}</Text>
                                    </Text>
                                </View>
                            </View>
                            {item.remarks ? (
                                <Text className={`text-sm italic mt-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}>"{item.remarks}"</Text>
                            ) : null}
                        </View>
                    ))}
                    {results.length === 0 && (
                        <View className="p-8 items-center"><Text className="text-gray-400">No assessment results available.</Text></View>
                    )}
                </View>
            </Animated.View>

        </ScrollView>
    );
}
