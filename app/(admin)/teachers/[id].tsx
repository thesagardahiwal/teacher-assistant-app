import { FormInput } from "@/components/admin/ui/FormInput";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { assessmentService, scheduleService } from "@/services";
import { attendanceService } from "@/services/attendance.service";
import { userService } from "@/services/user.service";
import { useAuth } from "@/store/hooks/useAuth";
import { useTeachers } from "@/store/hooks/useTeachers";
import { useTheme } from "@/store/hooks/useTheme";
import { Assessment } from "@/types/assessment.type";
import { Attendance } from "@/types/attendance.type";
import { ClassSchedule } from "@/types/schedule.type";
import { showAlert } from "@/utils/alert";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function EditTeacher() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();
    const { user } = useAuth();
    const { fetchTeachers } = useTeachers();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [department, setDepartment] = useState("");
    const [designation, setDesignation] = useState("");

    const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [attendance, setAttendance] = useState<Attendance[]>([]);

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
            setName(doc.name);
            setEmail(doc.email);
            setDepartment(doc.department || "");
            setDesignation(doc.designation || "");

            // Fetch Deep Academic Data
            const [schRes, assRes, attRes] = await Promise.all([
                scheduleService.listByTeacher(id as string),
                assessmentService.listByTeacher(institutionId!, id as string),
                attendanceService.listByTeacher(institutionId!, id as string),
            ]);
            setSchedules(schRes.documents);
            setAssessments(assRes.documents);
            setAttendance(attRes.documents);

        } catch (error) {
            showAlert("Error", "Failed to load teacher");
            router.back();
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async () => {
        showAlert("Delete", "Are you sure you want to delete this teacher? This will NOT delete their Auth account, only their profile.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await userService.delete(id as string);
                        if (institutionId) await fetchTeachers(institutionId);
                        router.back();
                    } catch (error) {
                        showAlert("Error", "Failed to delete");
                    }
                }
            }
        ])
    }

    const handleSubmit = async () => {
        if (!name || !email) {
            showAlert("Error", "Please fill in all required fields");
            return;
        }

        setSaving(true);
        try {
            await userService.update(id as string, {
                name,
                department,
                designation
            });

            if (institutionId) await fetchTeachers(institutionId);
            showAlert("Success", "Teacher updated successfully");
        } catch (error: any) {
            showAlert("Error", error.message || "Failed to update teacher");
        } finally {
            setSaving(false);
        }
    };

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
        )
    }

    const isAdmin = user?.role === "ADMIN";

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
            <View className="px-6 pt-6 w-full">
                <PageHeader
                    title={isAdmin ? "Edit Teacher" : "Teacher Details"}
                    rightAction={
                        isAdmin ? (
                            <TouchableOpacity onPress={handleDelete} className="bg-red-100 dark:bg-red-900 p-2 rounded-full">
                                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                            </TouchableOpacity>
                        ) : null
                    }
                />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} className="w-full px-6 pt-4 flex-1">
                <View className={`p-6 rounded-2xl mb-6 ${isDark ? "bg-gray-800" : "bg-white"}`}>

                    <FormInput
                        label="Full Name"
                        placeholder="John Doe"
                        value={name}
                        onChangeText={setName}
                        editable={isAdmin}
                    />

                    <View className="opacity-50">
                        <FormInput
                            label="Email Address"
                            value={email}
                            editable={false}
                        />
                    </View>

                    <FormInput
                        label="Department"
                        placeholder="Science"
                        value={department}
                        onChangeText={setDepartment}
                        editable={isAdmin}
                    />

                    <FormInput
                        label="Designation"
                        placeholder="Senior Teacher"
                        value={designation}
                        onChangeText={setDesignation}
                        editable={isAdmin}
                    />
                </View>

                {isAdmin && (
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={saving}
                        className={`py-4 rounded-xl items-center mb-10 ${saving ? "bg-blue-400" : "bg-blue-600"
                            }`}
                    >
                        {saving ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Save Changes</Text>
                        )}
                    </TouchableOpacity>
                )}

                {/* --- ACADEMIC FOOTPRINT --- */}
                <View className="my-4 border-t border-gray-200 dark:border-gray-800 pt-4">
                    <Text className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Academic Footprint</Text>
                    <Text className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Read-only view of academic activities</Text>
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

            </ScrollView>
        </View>
    );
}
