import { FormInput } from "@/components/admin/ui/FormInput";
import { FormSelect } from "@/components/admin/ui/FormSelect";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { assessmentService, scheduleService } from "@/services";
import { assignmentService } from "@/services/assignment.service";
import { attendanceService } from "@/services/attendance.service";
import { invitationService } from "@/services/invitation.service";
import { teacherService } from "@/services/teacher.service";
import { userService } from "@/services/user.service";
import { useTeachers } from "@/store/hooks/useTeachers";
import { useTheme } from "@/store/hooks/useTheme";
import { Assessment } from "@/types/assessment.type";
import { Attendance } from "@/types/attendance.type";
import { Invitation } from "@/types/invitations.type";
import { ClassSchedule } from "@/types/schedule.type";
import { TeacherAssignment } from "@/types/teacher-assignment.type";
import { User } from "@/types/user.type";
import { showAlert } from "@/utils/alert";
import { getInviteLink } from "@/utils/linking";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
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

const ReadOnlyField = ({ label, value }: { label: string; value: string | undefined }) => {
    const { isDark } = useTheme();
    return (
        <View className="mb-4">
            <Text className={`text-xs uppercase font-bold mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                {label}
            </Text>
            <View className={`p-3.5 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                <Text className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    {value || "N/A"}
                </Text>
            </View>
        </View>
    );
};

const StatCard = ({ icon, title, value, color }: any) => {
    const { isDark } = useTheme();
    return (
        <View className={`flex-1 p-4 rounded-xl border mr-3 min-w-[140px] ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
            <View className={`w-10 h-10 rounded-full items-center justify-center mb-3 ${color} bg-opacity-20`}>
                <Ionicons name={icon} size={20} color={color.replace('bg-', 'text-').replace('-100', '-600')} />
            </View>
            <Text className={`text-2xl font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>{value}</Text>
            <Text className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{title}</Text>
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
    const [invitation, setInvitation] = useState<Invitation | null>(null);

    const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [department, setDepartment] = useState("");
    const [designation, setDesignation] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [isActive, setIsActive] = useState(false);
    const [role, setRole] = useState("");

    useEffect(() => {
        if (id && institutionId) {
            loadData();
        }
    }, [id, institutionId]);

    const loadData = async () => {
        setLoading(true);
        setRefreshing(true);
        try {
            const doc = await userService.get(id as string);
            setTeacher(doc as User);

            // Init form
            setName(doc.name);
            setDepartment(doc.department || "");
            setDesignation(doc.designation || "");
            setPhone(doc.phone || "");
            setAddress(doc.address || "");
            setIsActive(doc.isActive);
            setRole(doc.role || "TEACHER");


            if (!doc.isActive) {
                try {
                    const invites = await invitationService.getByEmail(doc.email);
                    if (invites.documents.length > 0) {
                        setInvitation(invites.documents[0]);
                    }
                } catch (e) {
                    console.error("Failed to fetch invites", e);
                }
            }

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
            setRefreshing(false);
        }
    }

    const handleUpdate = async () => {
        if (!teacher) return;
        setSaving(true);
        try {
            // Check for existing Principal/Vice Principal if role is changing to one of those
            if ((role === "PRINCIPAL" || role === "VICE_PRINCIPAL") && role !== teacher.role) {
                const existingUsers = await teacherService.getUsersByRole(institutionId!, role);

                // Filter out the current user if they happen to be in the list (though unlikely if role changed locally)
                const otherUsers = existingUsers.documents.filter(u => u.$id !== teacher.$id);

                if (otherUsers.length > 0) {
                    const title = role === "PRINCIPAL" ? "Principal" : "Vice Principal";
                    showAlert("Cannot Change Role", `There is already a ${title} assigned to this institution. Please remove or demote them first.`);
                    setSaving(false);
                    return;
                }
            }

            await userService.update(teacher.$id, {
                name,
                department,
                designation,
                phone,
                address,
                isActive,
                role: role as any,
            });
            showAlert("Success", "Teacher updated successfully");
            fetchTeachers(institutionId!); // Refresh list
        } catch (error) {
            console.error(error);
            showAlert("Error", "Failed to update teacher");
        } finally {
            setSaving(false);
        }
    };

    const copyInviteLink = async () => {
        if (!invitation) return;
        const link = getInviteLink(invitation.token);
        await Clipboard.setStringAsync(link);
        showAlert("Success", "Invitation link copied to clipboard");
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

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
        >
            <View className="flex-1 p-4">
                <PageHeader title="Teacher Details" />
                <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />} className="flex-1 p-4" showsVerticalScrollIndicator={false}>

                    {invitation && !teacher?.isActive && (
                        <View className={`mb-6 p-4 rounded-xl border ${isDark ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-100"}`}>
                            <View className="flex-row items-start justify-between">
                                <View className="flex-1 mr-4">
                                    <Text className={`font-bold text-lg mb-1 ${isDark ? "text-blue-400" : "text-blue-700"}`}>
                                        Pending Invitation
                                    </Text>
                                    <Text className={`text-sm mb-3 ${isDark ? "text-blue-300" : "text-blue-600"}`}>
                                        This teacher has not accepted their invitation yet. You can copy the link below and share it with them manually.
                                    </Text>
                                    <View className={`p-3 rounded-lg flex-row items-center ${isDark ? "bg-gray-800" : "bg-white"}`}>
                                        <Text numberOfLines={1} className={`flex-1 mr-2 text-xs font-mono override-text-color ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                            {getInviteLink(invitation.token)}
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={copyInviteLink}
                                    className={`p-2 rounded-lg ${isDark ? "bg-blue-600" : "bg-blue-600"}`}
                                >
                                    <Ionicons name="copy-outline" size={20} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Edit Form */}
                    <View className={`mb-6 p-4 rounded-2xl ${isDark ? "bg-gray-800" : "bg-white"}`}>
                        <Text className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-800"}`}>
                            Personal Details
                        </Text>

                        <FormInput
                            label="Full Name"
                            value={name}
                            onChangeText={setName}
                            placeholder="Teacher Name"
                        />

                        <ReadOnlyField label="Email" value={teacher?.email} />

                        <FormInput
                            label="Department"
                            value={department}
                            onChangeText={setDepartment}
                            placeholder="Department"
                        />

                        <FormInput
                            label="Designation"
                            value={designation}
                            onChangeText={setDesignation}
                            placeholder="Designation"
                        />

                        <FormInput
                            label="Phone"
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Phone Number"
                            keyboardType="phone-pad"
                        />

                        <FormInput
                            label="Address"
                            value={address}
                            onChangeText={setAddress}
                            placeholder="Address"
                            multiline
                            numberOfLines={2}
                        />

                        <FormSelect
                            label="Status"
                            value={isActive ? "Active" : "Inactive"}
                            options={[{ label: "Active", value: "Active" }, { label: "Inactive", value: "Inactive" }]}
                            onChange={(val) => setIsActive(val === "Active")}
                            placeholder="Select Status"
                        />

                        <FormSelect
                            label="Role"
                            value={role}
                            options={[
                                { label: "Teacher", value: "TEACHER" },
                                { label: "Principal", value: "PRINCIPAL" },
                                { label: "Vice Principal", value: "VICE_PRINCIPAL" }
                            ]}
                            onChange={setRole}
                            placeholder="Select Role"
                        />

                        <TouchableOpacity
                            onPress={handleUpdate}
                            disabled={saving}
                            className={`py-4 rounded-xl items-center mt-4 ${saving ? "bg-blue-400" : "bg-blue-600"}`}
                        >
                            {saving ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-lg">Update Teacher</Text>
                            )}
                        </TouchableOpacity>

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
        </KeyboardAvoidingView>
    );
}
