import { FormInput } from "@/components/admin/ui/FormInput";
import { FormSelect } from "@/components/admin/ui/FormSelect";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { studentService } from "@/services";
import { userService } from "@/services/user.service";
import { useAuth } from "@/store/hooks/useAuth";
import { useClasses } from "@/store/hooks/useClasses";
import { useCourses } from "@/store/hooks/useCourses";
import { useStudents } from "@/store/hooks/useStudents";
import { useTheme } from "@/store/hooks/useTheme";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
    const [selectedClass, setSelectedClass] = useState("");
    const [userId, setUserId] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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
        try {
            const doc = await studentService.get(id as string);
            setRoll(doc.rollNumber);
            setCourse(doc.course?.$id || "");
            setSelectedClass(doc.class?.$id || "");

            // Load User Details
            if (doc.user) {
                setUserId(doc.user.$id);
                // In case doc.user is not fully populated with email, fetch it
                try {
                    const userDoc = await userService.get(doc.user.$id);
                    setName(userDoc.name);
                    setEmail(userDoc.email);
                } catch {
                    setName(doc.user.name);
                    setEmail(doc.user.email);
                }
            }
        } catch (error) {
            Alert.alert("Error", "Failed to load student");
            router.back();
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async () => {
        Alert.alert("Delete", "Are you sure you want to delete this student? This will NOT delete their Auth account, only their student profile.", [
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
                        Alert.alert("Error", "Failed to delete");
                    }
                }
            }
        ])
    }

    const handleSubmit = async () => {
        if (!name || !roll || !course || !selectedClass) {
            Alert.alert("Error", "Please fill in all required fields");
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
                await userService.update(userId, { name });
            }

            if (institutionId) await fetchStudents(institutionId);
            Alert.alert("Success", "Student updated successfully");
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to update student");
        } finally {
            setSaving(false);
        }
    };

    const courseOptions = courses.map(c => ({ label: `${c.name} (${c.code})`, value: c.$id }));
    const classOptions = classes
        .filter(c => c.course?.$id === course)
        .map(c => ({ label: `Year ${c.year} - ${c.division}`, value: c.$id }));

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

            <ScrollView showsVerticalScrollIndicator={false}>
                <View className={`p-6 rounded-2xl mb-6 ${isDark ? "bg-gray-800" : "bg-white"}`}>

                    <FormInput
                        label="Full Name"
                        placeholder="Student Name"
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
                        label="Roll Number"
                        placeholder="101"
                        value={roll}
                        onChangeText={setRoll}
                        editable={isAdmin}
                    />

                    <FormSelect
                        label="Course"
                        value={course}
                        onChange={setCourse}
                        options={courseOptions}
                        placeholder="Select Course"
                        editable={isAdmin}
                    />

                    <FormSelect
                        label="Class"
                        value={selectedClass}
                        onChange={setSelectedClass}
                        options={classOptions}
                        placeholder="Select Class"
                        error={course && classOptions.length === 0 ? "No classes found for this course" : undefined}
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
            </ScrollView>
        </View>
    );
}
