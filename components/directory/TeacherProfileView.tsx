import { PhoneDisplay } from "@/components/common/PhoneDisplay";
import { useTheme } from "@/store/hooks/useTheme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface TeacherProfileViewProps {
    teacher: any;
    stats?: {
        subjects: number;
        lectures: number;
        classes: number;
        assessments: number;
    };
    assignments?: any[]; // derived or raw assignments
    schedules?: any[]; // for workload
    attendanceStats?: {
        totalSessions: number;
        classes: string[];
    };
    children?: React.ReactNode; // For Admin Edit Form or extra actions
}

export function TeacherProfileView({
    teacher,
    stats,
    assignments = [],
    schedules = [],
    attendanceStats,
    children
}: TeacherProfileViewProps) {
    const { isDark } = useTheme();

    if (!teacher) return null;

    // Derived Data helper
    const lecturesPerDay = schedules.reduce((acc, curr) => {
        const day = curr.dayOfWeek?.substring(0, 3).toUpperCase() || "OTH";
        acc[day] = (acc[day] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const StatCard = ({ icon, title, value, color }: any) => (
        <View className={`flex-1 p-4 rounded-2xl border mr-3 min-w-[140px] ${isDark ? "bg-dark-card border-dark-border" : "bg-white border-gray-100"}`}>
            <View className={`w-10 h-10 rounded-full items-center justify-center mb-3 ${color} bg-opacity-20`}>
                <Ionicons name={icon} size={20} color={color.replace('bg-', 'text-').replace('-100', '-600')} />
            </View>
            <Text className={`text-2xl font-bold mb-1 ${isDark ? "text-dark-textPrimary" : "text-textPrimary"}`}>{value}</Text>
            <Text className={`text-xs ${isDark ? "text-dark-textSecondary" : "text-textSecondary"}`}>{title}</Text>
        </View>
    );

    const SectionHeader = ({ title, icon }: any) => (
        <View className="flex-row items-center mb-4 mt-8">
            <View className={`p-2 rounded-lg mr-3 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                <MaterialCommunityIcons name={icon} size={20} color={isDark ? "#9CA3AF" : "#4B5563"} />
            </View>
            <Text className={`text-lg font-bold ${isDark ? "text-dark-textPrimary" : "text-textPrimary"}`}>{title}</Text>
        </View>
    );

    return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            {/* A. Profile Card */}
            <Animated.View entering={FadeInDown.delay(100).springify()} className={`p-6 rounded-3xl mb-2 items-center ${isDark ? "bg-dark-card" : "bg-white"} shadow-sm mx-1 mt-1`}>
                <View className={`w-24 h-24 rounded-full items-center justify-center mb-4 border-4 ${isDark ? "bg-blue-900/30 border-blue-900/50" : "bg-blue-50 border-white"} shadow-sm`}>
                    <Text className="text-4xl font-bold text-primary dark:text-dark-primary">{teacher.name?.charAt(0)}</Text>
                </View>
                <Text className={`text-2xl font-bold mb-1 text-center ${isDark ? "text-dark-textPrimary" : "text-textPrimary"}`}>{teacher.name}</Text>
                <Text className={`text-sm mb-5 text-center ${isDark ? "text-dark-textSecondary" : "text-textSecondary"}`}>{teacher.email}</Text>

                <View className="flex-row gap-2 flex-wrap justify-center">
                    <View className={`px-4 py-1.5 rounded-full ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                        <Text className={`text-xs font-semibold ${isDark ? "text-gray-300" : "text-gray-600"}`}>{teacher.role}</Text>
                    </View>
                    {teacher.department && (
                        <View className={`px-4 py-1.5 rounded-full ${isDark ? "bg-purple-900/30" : "bg-purple-50"}`}>
                            <Text className={`text-xs font-semibold ${isDark ? "text-purple-300" : "text-purple-700"}`}>{teacher.department}</Text>
                        </View>
                    )}
                </View>
                {teacher.phone && (
                    <PhoneDisplay phone={teacher.phone} className="mt-5" />
                )}
            </Animated.View>

            {/* Custom Content (e.g. Admin Edit Form) */}
            {children && (
                <Animated.View entering={FadeInDown.delay(200).springify()} className="mb-2">
                    {children}
                </Animated.View>
            )}

            {/* B. Academic Overview (Stats) */}
            {stats && (
                <Animated.View entering={FadeInDown.delay(300).springify()}>
                    <SectionHeader title="Academic Snapshot" icon="school-outline" />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2 -mx-1 px-1">
                        <StatCard icon="book-outline" title="Subjects" value={stats.subjects} color="text-blue-600 bg-blue-100" />
                        <StatCard icon="calendar-outline" title="Lectures/Wk" value={stats.lectures} color="text-pink-600 bg-pink-100" />
                        <StatCard icon="people-outline" title="Classes" value={stats.classes} color="text-emerald-600 bg-emerald-100" />
                        <StatCard icon="clipboard-outline" title="Assessments" value={stats.assessments} color="text-amber-600 bg-amber-100" />
                    </ScrollView>
                </Animated.View>
            )}

            {/* C. Workload */}
            <Animated.View entering={FadeInDown.delay(400).springify()}>
                <SectionHeader title="Weekly Workload" icon="clock-time-four-outline" />
                <View className="flex-row flex-wrap gap-2">
                    {["MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day, idx) => (
                        <View key={day} className={`flex-1 items-center p-3 rounded-2xl min-w-[14%] ${isDark ? "bg-dark-card" : "bg-white border border-gray-100"}`}>
                            <Text className={`text-[10px] font-bold mb-1 ${isDark ? "text-dark-textSecondary" : "text-textSecondary"}`}>{day}</Text>
                            <View className={`w-8 h-8 rounded-full items-center justify-center ${lecturesPerDay[day] > 0 ? (isDark ? "bg-blue-900/50" : "bg-blue-100") : "bg-transparent"}`}>
                                <Text className={`text-sm font-bold ${lecturesPerDay[day] > 0 ? (isDark ? "text-blue-400" : "text-blue-600") : (isDark ? "text-gray-600" : "text-gray-300")}`}>
                                    {lecturesPerDay[day] || "-"}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            </Animated.View>

            {/* D. Assignments */}
            <Animated.View entering={FadeInDown.delay(500).springify()}>
                <SectionHeader title="Assigned Classes" icon="briefcase-outline" />
                <View className={`rounded-2xl overflow-hidden ${isDark ? "bg-dark-card border border-dark-border" : "bg-white border border-gray-100"}`}>
                    <View className={`flex-row p-4 border-b ${isDark ? "border-gray-800" : "border-gray-100"}`}>
                        <View className="flex-1"><Text className={`font-semibold ${isDark ? "text-dark-textSecondary" : "text-textSecondary"}`}>Subject</Text></View>
                        <View className="flex-1"><Text className={`font-semibold ${isDark ? "text-dark-textSecondary" : "text-textSecondary"}`}>Class</Text></View>
                    </View>
                    {assignments.map((assign, idx) => (
                        <View key={idx} className={`flex-row p-4 border-b last:border-0 ${isDark ? "border-gray-800" : "border-gray-100"}`}>
                            <View className="flex-1"><Text className={`font-medium ${isDark ? "text-dark-textPrimary" : "text-textPrimary"}`}>{assign.subject}</Text></View>
                            <View className="flex-1"><Text className={isDark ? "text-dark-textSecondary" : "text-textSecondary"}>{assign.class}</Text></View>
                        </View>
                    ))}
                    {assignments.length === 0 && (
                        <View className="p-6 items-center"><Text className={`italic ${isDark ? "text-gray-600" : "text-gray-400"}`}>No assigned classes found.</Text></View>
                    )}
                </View>
            </Animated.View>

            {/* E. Attendance */}
            {attendanceStats && (
                <Animated.View entering={FadeInDown.delay(600).springify()}>
                    <SectionHeader title="Attendance Activity" icon="checkbox-marked-circle-outline" />
                    <View className={`p-5 rounded-2xl ${isDark ? "bg-dark-card border border-dark-border" : "bg-white border border-gray-100"}`}>
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className={`text-base ${isDark ? "text-dark-textSecondary" : "text-textSecondary"}`}>Total Sessions</Text>
                            <Text className={`text-2xl font-bold ${isDark ? "text-dark-textPrimary" : "text-textPrimary"}`}>{attendanceStats.totalSessions}</Text>
                        </View>
                        <View className={`h-px my-2 ${isDark ? "bg-gray-800" : "bg-gray-100"}`} />
                        <Text className={`text-sm ${isDark ? "text-dark-muted" : "text-muted"}`}>
                            Active in: {attendanceStats.classes.join(", ") || "No classes yet"}
                        </Text>
                    </View>
                </Animated.View>
            )}
        </ScrollView>
    );
}
