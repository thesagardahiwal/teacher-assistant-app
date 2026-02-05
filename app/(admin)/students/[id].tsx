import { FormInput } from "@/components/admin/ui/FormInput";
import { FormSelect } from "@/components/admin/ui/FormSelect";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { StudentProfileView } from "@/components/directory/StudentProfileView";
import WebStudentDetails from "@/components/web/WebStudentDetails";
import { studentService } from "@/services";
import { assessmentResultService } from "@/services/assessmentResult.service";
import { invitationService } from "@/services/invitation.service";
import { useAuth } from "@/store/hooks/useAuth";
import { useClasses } from "@/store/hooks/useClasses";
import { useCourses } from "@/store/hooks/useCourses";
import { useStudents } from "@/store/hooks/useStudents";
import { useTheme } from "@/store/hooks/useTheme";
import { AssessmentResult } from "@/types/assessmentResult.type";
import { showAlert } from "@/utils/alert";
import { useSafeBack } from "@/utils/navigation";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from "expo-router";
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

export default function EditStudent() {
    const router = useRouter();
    const { goBack } = useSafeBack();
    const { id } = useLocalSearchParams();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();
    const { user } = useAuth();

    const { fetchStudents } = useStudents();
    const { data: courses, fetchCourses } = useCourses();
    const { data: classes, fetchClasses } = useClasses();

    // Data State
    const [student, setStudent] = useState<any>(null);
    const [results, setResults] = useState<AssessmentResult[]>([]);

    // Form State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [roll, setRoll] = useState("");
    const [course, setCourse] = useState("");
    const [selectedClass, setSelectedClass] = useState<string>("");
    const [userId, setUserId] = useState("");
    const [phone, setPhone] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [invitationLink, setInvitationLink] = useState("");
    const [copying, setCopying] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (institutionId) {
            fetchCourses(institutionId);
            fetchClasses(institutionId);
        }
    }, [institutionId]);

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        setRefreshing(true);
        try {
            const doc = await studentService.get(id as string);
            setStudent(doc as any);
            setRoll(doc.rollNumber);
            setCourse(doc.course?.$id || "");
            setSelectedClass(doc.class.$id);

            // Fetch Results
            try {
                // We use checkResults or list results. The Service might not have a direct "listByStudent" 
                // in the snippet provided previously, but let's assume valid service usage or default to empty.
                // Reusing logic from student details:
                const res = await assessmentResultService.listByStudent(institutionId!, doc.$id);
                setResults(res.documents);
            } catch (e) {
                console.log("Results fetch error", e);
            }

            // Load User Details
            if (doc) {
                setUserId(doc.$id);
                try {
                    const userDoc = await studentService.get(doc.$id);
                    setName(userDoc.name);
                    setEmail(userDoc.email || '');
                    setPhone(userDoc.phone || '');
                } catch {
                    setName(doc.name);
                    setEmail(doc.email || '');
                }

                // If student is inactive
                if (!doc.isActive) {
                    try {
                        const invites = await invitationService.getByUserId(doc.$id);
                        if (invites.documents.length > 0) {
                            const token = invites.documents[0].token;
                            let origin = "";
                            if (Platform.OS === 'web' && typeof window !== 'undefined') {
                                origin = window.location.origin;
                            } else {
                                origin = "exp://192.168.1.5:8081";
                            }
                            if (Platform.OS === 'web') {
                                setInvitationLink(`${origin}/(auth)/invite?token=${token}`);
                            } else {
                                setInvitationLink(`(auth)/invite?token=${token}`);
                            }
                        }
                    } catch (e) {
                        console.error("Failed to load invitation", e);
                    }
                }
            }
        } catch (error) {
            showAlert("Error", "Failed to load student");
            goBack();
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    const handleDelete = async () => {
        showAlert("Delete", "Are you sure you want to delete this student? This will NOT delete their Auth account, only their student profile.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await studentService.delete(id as string);
                        if (institutionId) await fetchStudents(institutionId);
                        goBack();
                    } catch (error) {
                        showAlert("Error", "Failed to delete");
                    }
                }
            }
        ])
    }

    const handleSubmit = async () => {
        if (!name || !roll || !course || !selectedClass) {
            showAlert("Error", "Please fill in all required fields");
            return;
        }

        setSaving(true);
        try {
            await studentService.update(id as string, {
                rollNumber: roll,
                course: course,
                class: selectedClass,
            });

            if (userId) {
                await studentService.update(userId, { name });
            }

            if (institutionId) await fetchStudents(institutionId);
            setIsEditing(false);
            showAlert("Success", "Student updated successfully");
            loadData(); // Reload basic data
        } catch (error: any) {
            showAlert("Error", error.message || "Failed to update student");
        } finally {
            setSaving(false);
        }
    };

    const courseOptions = courses.map(c => ({ label: `${c.name} (${c.code})`, value: c.$id }));
    const classOptions = classes
        .filter(c => {
            const courseId = typeof c.course === 'object' ? c.course?.$id : c.course;
            return courseId === course;
        })
        .map(c => ({ label: c.name, value: c.$id }));

    // Stats
    const averageScore = results.length > 0
        ? (results.reduce((acc, curr) => acc + (curr.obtainedMarks / curr.totalMarks * 100), 0) / results.length).toFixed(1)
        : "0";


    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? "bg-dark-background" : "bg-background"}`}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        )
    }

    if (Platform.OS === 'web') {
        return (
            <>
                <View className="px-8 bg-background dark:bg-dark-background pt-6 pb-2 border-b border-gray-200 dark:border-gray-800">
                    <PageHeader
                        title="Student Details"
                        showBack={true}
                    />
                </View>
                <WebStudentDetails
                    student={student}
                    stats={{
                        averageScore,
                        totalAssessments: results.length
                    }}
                    results={results}
                    onEdit={() => setIsEditing(true)}
                    invitationLink={invitationLink}
                    onCopyInvite={async () => {
                        await Clipboard.setStringAsync(invitationLink);
                        showAlert("Success", "Link copied");
                    }}
                />
                {/* Reusing existing Edit Modal logic but making it compatible with web overlay if needed. */}
                {isEditing && (
                    <View className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
                        <View className={`w-full max-w-2xl p-6 rounded-2xl ${isDark ? "bg-slate-900" : "bg-white"}`}>
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Edit Student</Text>
                                <TouchableOpacity onPress={() => setIsEditing(false)}>
                                    <Ionicons name="close" size={24} color={isDark ? "#94a3b8" : "#64748b"} />
                                </TouchableOpacity>
                            </View>
                            <ScrollView className="max-h-[80vh]">
                                <View className="gap-4">
                                    <FormInput label="Full Name" placeholder="Student Name" value={name} onChangeText={setName} />
                                    <FormInput label="Roll Number" placeholder="101" value={roll} onChangeText={setRoll} />
                                    <FormSelect label="Course" value={course} onChange={(val) => { setCourse(val); setSelectedClass(""); }} options={courseOptions} placeholder="Select Course" />
                                    <FormSelect label="Class" value={selectedClass} onChange={setSelectedClass} options={classOptions} placeholder={course ? "Select Class" : "Select Course first"} error={course && classOptions.length === 0 ? "No classes found for this course" : undefined} />
                                    <TouchableOpacity onPress={handleSubmit} disabled={saving} className={`py-4 rounded-xl items-center mt-4 mb-2 ${saving ? "bg-indigo-400" : "bg-indigo-600"}`}>
                                        {saving ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Save Changes</Text>}
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                )}
            </>
        );
    }


    const isAdmin = user?.role === "ADMIN";

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className={`flex-1 ${isDark ? "bg-dark-background" : "bg-background"}`}
        >
            <View className="flex-1">
                <View className="px-6 pt-6">
                    <PageHeader
                        title="Student Details"
                        showBack={true}
                        rightAction={
                            isAdmin ? (
                                <View className="flex-row gap-2">
                                    <TouchableOpacity
                                        onPress={() => setIsEditing(!isEditing)}
                                        className={`p-2 rounded-full ${isEditing ? "bg-red-100 dark:bg-red-900" : "bg-blue-100 dark:bg-blue-900"}`}
                                    >
                                        <Ionicons
                                            name={isEditing ? "close" : "create-outline"}
                                            size={20}
                                            color={isEditing ? "#EF4444" : "#2563EB"}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleDelete} className="bg-red-100 dark:bg-red-900 p-2 rounded-full">
                                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            ) : null
                        }
                    />
                </View>

                {/* Edit Form Overlay */}
                {isEditing && (
                    <Animated.View
                        entering={SlideInUp}
                        exiting={SlideOutUp}
                        className={`mx-4 mb-4 p-4 rounded-2xl border ${isDark ? "bg-dark-card border-dark-border" : "bg-white border-border"} z-10 absolute top-20 left-0 right-0 shadow-lg`}
                    >
                        <Text className={`text-lg font-bold mb-4 ${isDark ? "text-dark-textPrimary" : "text-textPrimary"}`}>
                            Edit Student
                        </Text>
                        <ScrollView className="max-h-96" showsVerticalScrollIndicator={true}>
                            <FormInput
                                label="Full Name"
                                placeholder="Student Name"
                                value={name}
                                onChangeText={setName}
                            />
                            <FormInput
                                label="Roll Number"
                                placeholder="101"
                                value={roll}
                                onChangeText={setRoll}
                            />
                            <FormSelect
                                label="Course"
                                value={course}
                                onChange={(val) => {
                                    setCourse(val);
                                    setSelectedClass("");
                                }}
                                options={courseOptions}
                                placeholder="Select Course"
                            />
                            <FormSelect
                                label="Class"
                                value={selectedClass}
                                onChange={setSelectedClass}
                                options={classOptions}
                                placeholder={course ? "Select Class" : "Select Course first"}
                                error={course && classOptions.length === 0 ? "No classes found for this course" : undefined}
                            />
                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={saving}
                                className={`py-4 rounded-xl items-center mt-4 mb-2 ${saving ? "bg-primary/70" : "bg-primary"}`}
                            >
                                {saving ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Save Changes</Text>}
                            </TouchableOpacity>
                        </ScrollView>
                    </Animated.View>
                )}

                <View className="flex-1 px-4">
                    <StudentProfileView
                        student={student}
                        stats={{
                            averageScore,
                            totalAssessments: results.length
                        }}
                        results={results}
                    >
                        {/* Custom Children: Invite Link */}
                        {invitationLink ? (
                            <View className={`mb-6 p-4 rounded-xl border ${isDark ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-100"}`}>
                                <Text className={`font-bold mb-1 ${isDark ? "text-blue-400" : "text-blue-700"}`}>
                                    Pending Invitation
                                </Text>
                                <View className="flex-row items-center mt-2">
                                    <Text numberOfLines={1} className={`flex-1 mr-2 text-xs opacity-70 ${isDark ? "text-blue-200" : "text-blue-800"}`}>
                                        {invitationLink}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={async () => {
                                            setCopying(true);
                                            await Clipboard.setStringAsync(invitationLink);
                                            setCopying(false);
                                            showAlert("Success", "Link copied");
                                        }}
                                        className="bg-blue-600 px-3 py-1.5 rounded-lg"
                                    >
                                        <Text className="text-white text-xs font-bold">{copying ? "..." : "Copy"}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : null}
                    </StudentProfileView>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
