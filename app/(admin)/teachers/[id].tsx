import { PageHeader } from "@/components/admin/ui/PageHeader";
import { UserProfileForm } from "@/components/common/UserProfileForm";
import { AdminTeacherProfileConfig } from "@/config/user-profile.config";
import { assessmentService, scheduleService } from "@/services";
import { assignmentService } from "@/services/assignment.service";
import { attendanceService } from "@/services/attendance.service";
import { userService } from "@/services/user.service";
import { useTeachers } from "@/store/hooks/useTeachers";
import { useTheme } from "@/store/hooks/useTheme";
import { Assessment } from "@/types/assessment.type";
import { Attendance } from "@/types/attendance.type";
import { ClassSchedule } from "@/types/schedule.type";
import { TeacherAssignment } from "@/types/teacher-assignment.type";
import { User } from "@/types/user.type";
import { showAlert } from "@/utils/alert";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    View
} from "react-native";

const SectionHeader = ({ title, icon }: { title: string; icon?: keyof typeof MaterialCommunityIcons.glyphMap }) => {
    const { isDark } = useTheme();
    return (
        <View className="flex-row items-center mb-4 mt-6 border-b border-gray-100 dark:border-gray-800 pb-2">
            {icon && <MaterialCommunityIcons name={icon} size={20} color={isDark ? "#9CA3AF" : "#4B5563"} style={{ marginRight: 8 }} />}
            <Text className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                {title}
            </Text>
        </View>
    );
};

export default function EditTeacher() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();
    const { fetchTeachers } = useTeachers();

    const [teacher, setTeacher] = useState<User | null>(null);

    const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (id && institutionId) {
            loadData();
        }
    }, [id, institutionId]);

    const loadData = async () => {
        try {
            const doc = await userService.get(id as string);
            setTeacher(doc as User);

            // Fetch Deep Academic Data
            const [schRes, assRes, attRes, assignRes] = await Promise.all([
                scheduleService.listByTeacher(id as string),
                assessmentService.listByTeacher(institutionId!, id as string),
                attendanceService.listByTeacher(institutionId!, id as string),
                assignmentService.listByTeacher(institutionId!, id as string),
            ]);
            setSchedules(schRes.documents);
            setAssessments(assRes.documents);
            setAttendance(attRes.documents);
            setTeacherAssignments(assignRes.documents);

        } catch (error) {
            console.error(error);
            showAlert("Error", "Failed to load teacher");
            router.back();
        } finally {
            setLoading(false);
        }
    }

    const handleUpdate = async (data: any) => {
        if (!teacher) return;
        setSaving(true);
        try {
            await userService.update(teacher.$id, data);
            showAlert("Success", "Teacher updated successfully");
            fetchTeachers(institutionId!); // Refresh list
        } catch (error) {
            console.error(error);
            showAlert("Error", "Failed to update teacher");
        } finally {
            setSaving(false);
        }
    };

    // B. Academic Assignments (Derived from Direct Assignments now)
    const uniqueSubjects = Array.from(new Set(schedules.map(s => s.subject?.name).filter(Boolean)));
    const uniqueClasses = Array.from(new Set(schedules.map(s => s.class?.name).filter(Boolean)));
    const totalLectures = schedules.length;

    const lecturesPerDay = schedules.reduce((acc, curr) => {
        const day = curr.dayOfWeek?.substring(0, 3).toUpperCase();
        if (day) {
            acc[day] = (acc[day] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const assessmentStats = assessments.reduce((acc, curr) => {
        const type = curr.type || "Other";
        acc[type] = (acc[type] || 0) + 1;
        acc.Total = (acc.Total || 0) + 1;
        return acc;
    }, { Total: 0 } as Record<string, number>);

    const totalSessions = attendance.length;
    const uniqueAttendanceClasses = Array.from(new Set(attendance.map(a => a.class?.name).filter(Boolean)));

    if (loading) {
        return (
            <View className={`flex-1 items-center justify-center ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
                <ActivityIndicator size="large" color="#2563EB" />
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

    // Customize config for Edit mode: Email should be read-only
    const editConfig = AdminTeacherProfileConfig.map(field =>
        field.name === 'email' ? { ...field, editable: false } : field
    );

    return (
        <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"} p-4`}>
            <PageHeader title="Teacher Details" />
            <ScrollView className="flex-1 p-4">

                {/* Reusable Profile Form */}
                <View className={`mb-6 p-4 rounded-2xl ${isDark ? "bg-gray-800" : "bg-white"}`}>
                    <UserProfileForm
                        initialData={teacher}
                        config={editConfig}
                        onSubmit={handleUpdate}
                        loading={loading}
                        saving={saving}
                    />
                </View>

                {/* Academic Snapshot */}
                <SectionHeader title="Academic Snapshot" icon="school-outline" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                    <StatCard icon="book-outline" title="Subjects" value={uniqueSubjects.length} color="text-blue-600 bg-blue-100" />
                    <StatCard icon="calendar-outline" title="Total Lectures" value={totalLectures} color="text-pink-600 bg-pink-100" />
                    <StatCard icon="people-outline" title="Classes" value={uniqueClasses.length} color="text-emerald-600 bg-emerald-100" />
                    <StatCard icon="clipboard-outline" title="Assessments" value={assessmentStats.Total} color="text-amber-600 bg-amber-100" />
                </ScrollView>

                {/* Assignments List */}
                <SectionHeader title="Assigned Classes & Subjects" icon="briefcase-outline" />
                <View className={`rounded-xl overflow-hidden mb-6 ${isDark ? "bg-gray-800 border border-gray-700" : "bg-white"}`}>
                    <View className="flex-row p-4 border-b border-gray-200 dark:border-gray-700">
                        <View className="flex-1"><Text className={`font-semibold ${isDark ? "text-gray-300" : "text-gray-500"}`}>Subject</Text></View>
                        <View className="flex-1"><Text className={`font-semibold ${isDark ? "text-gray-300" : "text-gray-500"}`}>Class</Text></View>
                    </View>

                    {teacherAssignments.map((assign, idx) => (
                        <View key={assign.$id || idx} className="flex-row p-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
                            <View className="flex-1">
                                <Text className={`font-medium ${isDark ? "text-white" : "text-gray-800"}`}>
                                    {assign.subject?.name} <Text className="text-xs text-gray-400">({assign.subject?.code})</Text>
                                </Text>
                            </View>
                            <View className="flex-1">
                                <Text className={isDark ? "text-gray-400" : "text-gray-600"}>
                                    {assign.class?.name} <Text className="text-xs">(Sem {assign.class?.semester})</Text>
                                </Text>
                            </View>
                        </View>
                    ))}

                    {teacherAssignments.length === 0 && (
                        <View className="p-4"><Text className="text-gray-400 italic">No classes assigned yet.</Text></View>
                    )}
                </View>

                {/* Schedule Breakdown */}
                <SectionHeader title="Weekly Workload" icon="clock-time-four-outline" />
                <View className="flex-row flex-wrap gap-2 mb-6">
                    {["MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                        <View key={day} className={`flex-1 items-center p-3 rounded-lg min-w-[14%] ${isDark ? "bg-gray-800" : "bg-white border border-gray-100"}`}>
                            <Text className={`text-xs font-bold mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>{day}</Text>
                            <Text className={`text-lg font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>{lecturesPerDay[day] || 0}</Text>
                        </View>
                    ))}
                </View>

                {/* Attendance Activity */}
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

            </ScrollView >
        </View >
    );
}
