import { FormInput } from "@/components/admin/ui/FormInput";
import { FormSelect } from "@/components/admin/ui/FormSelect";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { TeacherProfileView } from "@/components/directory/TeacherProfileView";
import WebTeacherDetails from "@/components/web/WebTeacherDetails";
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
import { useSafeBack } from "@/utils/navigation";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Animated, { SlideInUp, SlideOutUp } from "react-native-reanimated";

export default function EditTeacher() {
    const { goBack } = useSafeBack();
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
    const [isEditing, setIsEditing] = useState(false);

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
            goBack();
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    const handleUpdate = async () => {
        if (!teacher) return;
        setSaving(true);
        try {
            if ((role === "PRINCIPAL" || role === "VICE_PRINCIPAL") && role !== teacher.role) {
                const existingUsers = await teacherService.getUsersByRole(institutionId!, role);
                const otherUsers = existingUsers.documents.filter(u => u.$id !== teacher.$id);

                if (otherUsers.length > 0) {
                    const title = role === "PRINCIPAL" ? "Principal" : "Vice Principal";
                    showAlert("Cannot Change Role", `There is already a ${title} assigned to this institution.`);
                    setSaving(false);
                    return;
                }
            }

            const updated = await userService.update(teacher.$id, {
                name,
                department,
                designation,
                phone,
                address,
                isActive,
                role: role as any,
            });

            setTeacher(updated as User);
            setIsEditing(false);
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

    // Derived Stats
    const uniqueSubjects = Array.from(new Set(schedules.map(s => s.subject?.name).filter(Boolean)));
    const uniqueClasses = Array.from(new Set(schedules.map(s => s.class?.name).filter(Boolean)));
    const assessmentStats = assessments.reduce((acc, curr) => ({ Total: acc.Total + 1 }), { Total: 0 });
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

    if (Platform.OS === 'web') {
        const inviteLink = invitation && !teacher?.isActive ? getInviteLink(invitation.token) : undefined;
        return (
            <>
                <View className="px-8 bg-background dark:bg-dark-background pt-6 pb-2 border-b border-gray-200 dark:border-gray-800">
                    <PageHeader
                        title="Teacher Details"
                        showBack={true}

                    />
                </View>
                <WebTeacherDetails
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
                    onEdit={() => setIsEditing(true)}
                    invitationLink={inviteLink}
                    onCopyInvite={copyInviteLink}
                />
                {/* Reusing existing Edit Modal logic but making it compatible with web overlay if needed. 
                     For now, existing modal logic inside KeyboardAvoidingView might need adjustment for Web.
                     Actually, the Form Logic is below. I should probably refactor the Form to be a separate component 
                     or ensure `isEditing` works here too.
                     
                     The current `isEditing` state toggles a view inside the main layout. 
                     For Web, unique layout is used. I'll add the Edit Form overlay here too if `isEditing` is true.
                 */}
                {isEditing && (
                    <View className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
                        <View className={`w-full max-w-2xl p-6 rounded-2xl ${isDark ? "bg-slate-900" : "bg-white"}`}>
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Edit Profile</Text>
                                <TouchableOpacity onPress={() => setIsEditing(false)}>
                                    <Ionicons name="close" size={24} color={isDark ? "#94a3b8" : "#64748b"} />
                                </TouchableOpacity>
                            </View>
                            <ScrollView className="max-h-[80vh]">
                                <View className="gap-4">
                                    <FormInput label="Full Name" value={name} onChangeText={setName} placeholder="Name" />
                                    <FormInput label="Department" value={department} onChangeText={setDepartment} placeholder="Department" />
                                    <FormInput label="Designation" value={designation} onChangeText={setDesignation} placeholder="Designation" />
                                    <FormInput label="Phone" value={phone} onChangeText={setPhone} placeholder="Phone" />
                                    <FormInput label="Address" value={address} onChangeText={setAddress} placeholder="Address" />
                                    <FormSelect
                                        label="Status"
                                        value={isActive ? "Active" : "Inactive"}
                                        options={[{ label: "Active", value: "Active" }, { label: "Inactive", value: "Inactive" }]}
                                        onChange={(val) => setIsActive(val === "Active")}
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
                                    />
                                    <TouchableOpacity
                                        onPress={handleUpdate}
                                        disabled={saving}
                                        className={`mt-4 py-3 rounded-xl items-center ${saving ? "bg-blue-400" : "bg-blue-600"}`}
                                    >
                                        <Text className="text-white font-bold">{saving ? "Saving..." : "Save Changes"}</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                )}
            </>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className={`flex-1 ${isDark ? "bg-dark-background" : "bg-background"}`}
        >
            <View className="flex-1">
                <View className="px-6 pt-6">
                    <PageHeader
                        title="Teacher Details"
                        showBack={true}
                        rightAction={
                            <TouchableOpacity
                                onPress={() => setIsEditing(!isEditing)}
                                className={`p-2 rounded-full ${isEditing ? "bg-red-100" : "bg-blue-100"}`}
                            >
                                <Ionicons
                                    name={isEditing ? "close" : "create-outline"}
                                    size={24}
                                    color={isEditing ? "#EF4444" : "#2563EB"}
                                />
                            </TouchableOpacity>
                        }
                    />
                </View>

                {/* Edit Form - Animated visibility */}
                {isEditing && (
                    <Animated.View
                        entering={SlideInUp}
                        exiting={SlideOutUp}
                        className={`mx-4 mb-4 p-4 rounded-2xl border ${isDark ? "bg-dark-card border-dark-border" : "bg-white border-border"} z-10 absolute top-20 left-0 right-0 shadow-lg`}
                    >
                        <Text className={`text-lg font-bold mb-4 ${isDark ? "text-dark-textPrimary" : "text-textPrimary"}`}>
                            Edit Profile
                        </Text>

                        <ScrollView className="max-h-96" showsVerticalScrollIndicator={true}>
                            <FormInput
                                label="Full Name"
                                value={name}
                                onChangeText={setName}
                                placeholder="Teacher Name"
                            />
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
                                className={`py-4 rounded-xl items-center mt-4 mb-2 ${saving ? "bg-primary/70" : "bg-primary"}`}
                            >
                                {saving ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Save Changes</Text>}
                            </TouchableOpacity>
                        </ScrollView>
                    </Animated.View>
                )}

                <View className="flex-1 px-4">
                    <TeacherProfileView
                        teacher={teacher}
                        stats={{
                            subjects: uniqueSubjects.length,
                            lectures: schedules.length, // total weekly
                            classes: uniqueClasses.length,
                            assessments: assessmentStats.Total
                        }}
                        assignments={uniqueAssignments}
                        schedules={schedules}
                        attendanceStats={{
                            totalSessions: attendance.length,
                            classes: uniqueAttendanceClasses
                        }}
                    >
                        {/* Admin Actions Children: Invitation Link */}
                        {invitation && !teacher?.isActive && (
                            <View className={`mb-6 p-4 rounded-xl border ${isDark ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-100"}`}>
                                <View className="flex-row items-start justify-between">
                                    <View className="flex-1 mr-4">
                                        <Text className={`font-bold text-lg mb-1 ${isDark ? "text-blue-400" : "text-blue-700"}`}>
                                            Pending Invitation
                                        </Text>
                                        <Text className={`text-sm mb-3 ${isDark ? "text-blue-300" : "text-blue-600"}`}>
                                            This teacher has not accepted their invitation yet.
                                        </Text>
                                        <TouchableOpacity
                                            onPress={copyInviteLink}
                                            className="bg-blue-600 px-4 py-2 rounded-lg self-start"
                                        >
                                            <Text className="text-white font-bold text-sm">Copy Invite Link</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        )}
                    </TeacherProfileView>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
