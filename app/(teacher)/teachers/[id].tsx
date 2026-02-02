import { PageHeader } from "@/components/admin/ui/PageHeader";
import { TeacherProfileView } from "@/components/directory/TeacherProfileView";
import { assessmentService, scheduleService, teacherService } from "@/services";
import { attendanceService } from "@/services/attendance.service";
import { useTheme } from "@/store/hooks/useTheme";
import { Assessment } from "@/types/assessment.type";
import { Attendance } from "@/types/attendance.type";
import { ClassSchedule } from "@/types/schedule.type";
import { User } from "@/types/user.type";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function TeacherDetailScreen() {
    const { id } = useLocalSearchParams();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();

    const [teacher, setTeacher] = useState<User | null>(null);
    const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        if (!id || !institutionId) return;
        setLoading(true);
        setRefreshing(true);
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
            setRefreshing(false);
        }
    };
    useEffect(() => {
        loadData();
    }, [id, institutionId]);

    /* ---------------- DERIVED ANALYTICS ---------------- */

    // B. Academic Assignments
    const uniqueSubjects = Array.from(new Set(schedules.map(s => s.subject?.name).filter(Boolean)));
    const uniqueClasses = Array.from(new Set(schedules.map(s => s.class?.name).filter(Boolean)));

    // D. Assessments
    const assessmentStats = assessments.reduce((acc, curr) => {
        acc.Total = (acc.Total || 0) + 1;
        return acc;
    }, { Total: 0 } as Record<string, number>);

    // E. Attendance
    const uniqueAttendanceClasses = Array.from(new Set(attendance.map(a => a.class?.name).filter(Boolean)));

    // Combine Schedules for unique Assignment view in Profile
    const uniqueAssignments = Array.from(new Set(schedules.map(s => `${s.subject?.name}|${s.class?.name}`)))
        .map(combo => {
            const [subject, className] = combo.split('|');
            return { subject, class: className };
        });


    if (loading) {
        return (
            <View className={`flex-1 items-center justify-center ${isDark ? "bg-dark-background" : "bg-background"}`}>
                <ActivityIndicator size="large" color={isDark ? "#4C8DFF" : "#2563EB"} />
            </View>
        );
    }

    if (!teacher) {
        return (
            <View className={`flex-1 items-center justify-center ${isDark ? "bg-dark-background" : "bg-background"}`}>
                <Text className={isDark ? "text-white" : "text-gray-900"}>Teacher not found</Text>
            </View>
        );
    }

    return (
        <View className={`flex-1 ${isDark ? "bg-dark-background" : "bg-background"}`}>
            <View className="px-6 pt-6">
                <PageHeader title="Teacher Details" showBack={true} />
            </View>

            <View className="flex-1 px-4">
                <TeacherProfileView
                    teacher={teacher}
                    stats={{
                        subjects: uniqueSubjects.length,
                        lectures: schedules.length,
                        classes: uniqueClasses.length,
                        assessments: assessmentStats.Total
                    }}
                    assignments={uniqueAssignments}
                    schedules={schedules}
                    attendanceStats={{
                        totalSessions: attendance.length,
                        classes: uniqueAttendanceClasses
                    }}
                />
            </View>
        </View>
    );
}
