import { PageHeader } from "@/components/admin/ui/PageHeader";
import { assessmentService, scheduleService, teacherService } from "@/services";
import { attendanceService } from "@/services/attendance.service";
import { useTheme } from "@/store/hooks/useTheme";
import { Assessment } from "@/types/assessment.type";
import { Attendance } from "@/types/attendance.type";
import { ClassSchedule } from "@/types/schedule.type";
import { User } from "@/types/user.type";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

export default function StudentTeacherDetailScreen() {
    const { id } = useLocalSearchParams();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();

    const [teacher, setTeacher] = useState<User | null>(null);
    const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id || !institutionId) return;

        const loadData = async () => {
            try {
                // 1. Fetch Teacher Profile
                const teacherRes = await teacherService.get(id as string);
                setTeacher(teacherRes);

                // 2. Fetch Deep Academic Data
                const [schRes, assRes, attRes] = await Promise.all([
                    scheduleService.listByTeacher(id as string),
                    assessmentService.listByTeacher(institutionId, id as string),
                    attendanceService.listByTeacher(institutionId, id as string),
                ]);

                setSchedules(schRes.documents);
                setAssessments(assRes.documents);
                setAttendance(attRes.documents);

            } catch (error) {
                console.error("Failed to load teacher details", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id, institutionId]);

    /* ---------------- DERIVED ANALYTICS ---------------- */

    // B. Academic Assignments
    const uniqueSubjects = Array.from(new Set(schedules.map(s => s.subject?.name).filter(Boolean)));
    const uniqueClasses = Array.from(new Set(schedules.map(s => s.class?.name).filter(Boolean)));
    const totalLectures = schedules.length;

    // C. Schedule Overview
    const lecturesPerDay = schedules.reduce((acc, curr) => {
        const day = curr.dayOfWeek?.substring(0, 3).toUpperCase() || "OTH";
        acc[day] = (acc[day] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // D. Assessments
    const assessmentStats = assessments.reduce((acc, curr) => {
        const type = curr.type || "Other";
        acc[type] = (acc[type] || 0) + 1;
        acc.Total = (acc.Total || 0) + 1;
        return acc;
    }, { Total: 0 } as Record<string, number>);

    // E. Attendance
    const totalSessions = attendance.length;
    const uniqueAttendanceClasses = Array.from(new Set(attendance.map(a => a.class?.name).filter(Boolean)));


    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    if (!teacher) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
                <Text className={isDark ? "text-white" : "text-gray-900"}>Teacher not found</Text>
            </View>
        );
    }

    const StatCard = ({ icon, title, value, color }: any) => (
        <View className={`flex-1 p-4 rounded-xl border mr-3 min-w-[140px] ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
            <View className={`w-10 h-10 rounded-full items-center justify-center mb-3 ${color} bg-opacity-20`}>
                <Ionicons name={icon} size={20} color={color.replace('bg-', 'text-').replace('-100', '-600')} />
            </View>
            <Text className={`text-2xl font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>{value}</Text>
            <Text className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{title}</Text>
        </View>
    );

    const SectionHeader = ({ title, icon }: any) => (
        <View className="flex-row items-center mb-4 mt-6">
            <MaterialCommunityIcons name={icon} size={20} color={isDark ? "#9CA3AF" : "#4B5563"} />
            <Text className={`text-lg font-bold ml-2 ${isDark ? "text-white" : "text-gray-800"}`}>{title}</Text>
        </View>
    );

    return (
        <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
            <View className="px-6 pt-6 mb-4 w-full">
                <PageHeader title="Teacher Profile" showBack={true} />
            </View>

            <ScrollView className="flex-1 w-full" contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 24 }}>

                {/* A. Profile Card */}
                <View className={`p-6 rounded-2xl mb-6 items-center ${isDark ? "bg-gray-800" : "bg-white shadow-sm shadow-gray-200"}`}>
                    <View className={`w-20 h-20 rounded-full items-center justify-center mb-4 ${isDark ? "bg-purple-900/50" : "bg-purple-50"}`}>
                        <Text className="text-3xl font-bold text-purple-600">{teacher.name?.charAt(0)}</Text>
                    </View>
                    <Text className={`text-xl font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>{teacher.name}</Text>
                    <Text className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{teacher.email}</Text>

                    <View className="flex-row gap-2">
                        <View className={`px-3 py-1 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                            <Text className={`text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-600"}`}>{teacher.role}</Text>
                        </View>
                        {teacher.department && (
                            <View className={`px-3 py-1 rounded-full ${isDark ? "bg-blue-900/30" : "bg-blue-50"}`}>
                                <Text className={`text-xs font-medium ${isDark ? "text-blue-300" : "text-blue-700"}`}>{teacher.department}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* B. Academic Overview (Stats) */}
                <SectionHeader title="Academic Snapshot" icon="school-outline" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                    <StatCard icon="book-outline" title="Subjects" value={uniqueSubjects.length} color="text-blue-600 bg-blue-100" />
                    <StatCard icon="calendar-outline" title="Total Lectures" value={totalLectures} color="text-pink-600 bg-pink-100" />
                    <StatCard icon="people-outline" title="Classes" value={uniqueClasses.length} color="text-emerald-600 bg-emerald-100" />
                    <StatCard icon="clipboard-outline" title="Assessments" value={assessmentStats.Total} color="text-amber-600 bg-amber-100" />
                </ScrollView>

                {/* C. Assignments List */}
                <SectionHeader title="Assignments" icon="briefcase-outline" />
                <View className={`rounded-xl overflow-hidden mb-6 ${isDark ? "bg-gray-800 border border-gray-700" : "bg-white"}`}>
                    <View className="flex-row p-4 border-b border-gray-200 dark:border-gray-700">
                        <View className="flex-1"><Text className={`font-semibold ${isDark ? "text-gray-300" : "text-gray-500"}`}>Subject</Text></View>
                        <View className="flex-1"><Text className={`font-semibold ${isDark ? "text-gray-300" : "text-gray-500"}`}>Class</Text></View>
                    </View>
                    {/* Unique combinations of Subject + Class from schedules */}
                    {Array.from(new Set(schedules.map(s => `${s.subject?.name}|${s.class?.name}`))).map((combo, idx) => {
                        const [subj, cls] = combo.split('|');
                        return (
                            <View key={idx} className="flex-row p-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
                                <View className="flex-1"><Text className={`font-medium ${isDark ? "text-white" : "text-gray-800"}`}>{subj}</Text></View>
                                <View className="flex-1"><Text className={isDark ? "text-gray-400" : "text-gray-600"}>{cls}</Text></View>
                            </View>
                        )
                    })}
                    {schedules.length === 0 && (
                        <View className="p-4"><Text className="text-gray-400 italic">No assigned schedules.</Text></View>
                    )}
                </View>

                {/* D. Schedule Breakdown */}
                <SectionHeader title="Weekly Workload" icon="clock-time-four-outline" />
                <View className="flex-row flex-wrap gap-2 mb-6">
                    {["MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                        <View key={day} className={`flex-1 items-center p-3 rounded-lg min-w-[14%] ${isDark ? "bg-gray-800" : "bg-white border border-gray-100"}`}>
                            <Text className={`text-xs font-bold mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>{day}</Text>
                            <Text className={`text-lg font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>{lecturesPerDay[day] || 0}</Text>
                        </View>
                    ))}
                </View>

                {/* E. Attendance Activity */}
                <SectionHeader title="Attendance Activity" icon="checkbox-marked-circle-outline" />
                <View className={`p-4 rounded-xl mb-6 ${isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-100"}`}>
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className={`text-base ${isDark ? "text-gray-300" : "text-gray-600"}`}>Total Sessions Taken</Text>
                        <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{totalSessions}</Text>
                    </View>
                    <View className="h-px bg-gray-100 dark:bg-gray-700 my-2" />
                    <Text className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                        Across classes: {uniqueAttendanceClasses.join(", ") || "None"}
                    </Text>
                </View>

            </ScrollView>
        </View>
    );
}
