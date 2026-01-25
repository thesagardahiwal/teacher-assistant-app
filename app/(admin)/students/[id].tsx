import { FormInput } from "@/components/admin/ui/FormInput";
import { FormSelect } from "@/components/admin/ui/FormSelect";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { studentService } from "@/services";
import { invitationService } from "@/services/invitation.service";
import { useAuth } from "@/store/hooks/useAuth";
import { useClasses } from "@/store/hooks/useClasses";
import { useCourses } from "@/store/hooks/useCourses";
import { useStudents } from "@/store/hooks/useStudents";
import { useTheme } from "@/store/hooks/useTheme";
import { showAlert } from "@/utils/alert";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function EditStudent() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();
    const { user } = useAuth();

    const { fetchStudents } = useStudents();
    const { data: courses, fetchCourses } = useCourses();
    const { data: classes, fetchClasses } = useClasses();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [roll, setRoll] = useState("");
    const [course, setCourse] = useState("");
    const [selectedClass, setSelectedClass] = useState<string>("");
    const [userId, setUserId] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [invitationLink, setInvitationLink] = useState("");
    const [copying, setCopying] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

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
            setRoll(doc.rollNumber);
            setCourse(doc.course?.$id || "");
            setSelectedClass(doc.class.$id);

            // Load User Details
            if (doc) {
                setUserId(doc.$id);
                try {
                    const userDoc = await studentService.get(doc.$id);
                    setName(userDoc.name);
                    setEmail(userDoc.email || '');
                } catch {
                    setName(doc.name);
                    setEmail(doc.email || '');
                }

                // If student is inactive, try to find unused invitation
                if (!doc.isActive) {
                    try {
                        const invites = await invitationService.getByUserId(doc.$id);
                        if (invites.documents.length > 0) {
                            const token = invites.documents[0].token;
                            // Construct link efficiently
                            // In dev: localhost:8081/invite?token=...
                            // In prod: domain/invite?token=...
                            // We can use window.location.origin if web, or hardcode/env for native if needed.
                            // For flexibility, let's try to grab origin if on web.
                            let origin = "";
                            if (Platform.OS === 'web' && typeof window !== 'undefined') {
                                origin = window.location.origin;
                            } else {
                                // Fallback for native or if simpler
                                origin = "exp://192.168.1.5:8081"; // Or dynamic from Constants
                            }
                            // Using a relative path for router is fine for internal nav, but for copying we need full URL.
                            // Assuming web usage mainly for copying links.
                            if (Platform.OS === 'web') {
                                setInvitationLink(`${origin}/(auth)/invite?token=${token}`);
                            } else {
                                setInvitationLink(`(auth)/invite?token=${token}`); // Partial for now
                            }
                        }
                    } catch (e) {
                        console.error("Failed to load invitation", e);
                    }
                }
            }
        } catch (error) {
            showAlert("Error", "Failed to load student");
            router.back();
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
                        router.back();
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
            // Update Student Document
            await studentService.update(id as string, {
                rollNumber: roll,
                course: course,
                class: selectedClass,
            });

            // Update User Document (Name)
            if (userId) {
                await studentService.update(userId, { name });
            }

            if (institutionId) await fetchStudents(institutionId);
            showAlert("Success", "Student updated successfully");
        } catch (error: any) {
            showAlert("Error", error.message || "Failed to update student");
        } finally {
            setSaving(false);
        }
    };

    const courseOptions = courses.map(c => ({ label: `${c.name} (${c.code})`, value: c.$id }));

    // Improved Filtering: Check for object or string ID safely
    const classOptions = classes
        .filter(c => {
            const courseId = typeof c.course === 'object' ? c.course?.$id : c.course;
            return courseId === course;
        })
        .map(c => ({ label: c.name, value: c.$id }));

    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        )
    }


    const isAdmin = user?.role === "ADMIN";

    return (
        <View className={`flex-1 px-6 pt-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
            <PageHeader
                title={isAdmin ? "Edit Student" : "Student Details"}
                rightAction={
                    isAdmin ? (
                        <TouchableOpacity onPress={handleDelete} className="bg-red-100 dark:bg-red-900 p-2 rounded-full">
                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                        </TouchableOpacity>
                    ) : null
                }
            />

            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />} showsVerticalScrollIndicator={false}>

                {/* Personal Info Card */}
                <View className={`p-6 rounded-2xl mb-4 ${isDark ? "bg-gray-800" : "bg-white"}`}>
                    <Text className={`text-lg font-bold mb-4 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                        Personal Information
                    </Text>

                    <FormInput
                        label="Full Name"
                        placeholder="Student Name"
                        value={name}
                        onChangeText={setName}
                        editable={isAdmin}
                    />

                    <View className="opacity-60">
                        <FormInput
                            label="Email Address"
                            value={email}
                            editable={false}
                        />
                    </View>
                </View>

                {/* Academic Info Card */}
                <View className={`p-6 rounded-2xl mb-6 ${isDark ? "bg-gray-800" : "bg-white"}`}>
                    <Text className={`text-lg font-bold mb-4 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                        Academic Details
                    </Text>

                    <FormInput
                        label="Roll Number"
                        placeholder="101"
                        value={roll}
                        onChangeText={setRoll}
                        editable={isAdmin}
                    />

                    <FormSelect
                        label="Course"
                        value={course}
                        onChange={(val) => {
                            setCourse(val);
                            setSelectedClass(""); // Reset class when course changes
                        }}
                        options={courseOptions}
                        placeholder="Select Course"
                        editable={isAdmin}
                    />

                    <FormSelect
                        label="Class"
                        value={selectedClass}
                        onChange={setSelectedClass}
                        options={classOptions}
                        placeholder={course ? "Select Class" : "Select Course first"}
                        error={course && classOptions.length === 0 ? "No classes found for this course" : undefined}
                        editable={isAdmin}
                    />
                </View>

                {/* Invitation Link Card (Only if inactive and link exists) */}
                {invitationLink ? (
                    <View className={`p-6 rounded-2xl mb-6 ${isDark ? "bg-gray-800" : "bg-white"}`}>
                        <Text className={`text-lg font-bold mb-4 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                            Invitation Link
                        </Text>
                        <Text className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            Share this link with the student to activate their account.
                        </Text>

                        <View className={`flex-row items-center p-3 rounded-xl border ${isDark ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                            <Text className={`flex-1 mr-3 text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`} numberOfLines={1}>
                                {invitationLink}
                            </Text>
                            <TouchableOpacity
                                onPress={async () => {
                                    setCopying(true);
                                    await Clipboard.setStringAsync(invitationLink);
                                    setCopying(false);
                                    showAlert("Success", "Link copied to clipboard");
                                }}
                                className="bg-blue-100 dark:bg-blue-900 px-3 py-2 rounded-lg"
                            >
                                <Text className="text-blue-600 dark:text-blue-300 font-semibold text-xs">
                                    {copying ? "Copying..." : "Copy"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : null}

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
            </ScrollView>
        </View>
    );
}
