import { FormInput } from "@/components/admin/ui/FormInput";
import { FormSelect } from "@/components/admin/ui/FormSelect";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { classService } from "@/services";
import { useAcademicYears } from "@/store/hooks/useAcademicYears";
import { useAuth } from "@/store/hooks/useAuth";
import { useClasses } from "@/store/hooks/useClasses";
import { useCourses } from "@/store/hooks/useCourses";
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

export default function EditClass() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();
    const { user } = useAuth();

    const { fetchClasses } = useClasses();
    const { data: courses, fetchCourses } = useCourses();
    const { data: academicYears, fetchAcademicYears } = useAcademicYears();

    const [semester, setSemester] = useState("");
    const [course, setCourse] = useState("");
    const [academicYear, setAcademicYear] = useState("");
    const [name, setName] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (institutionId) {
            fetchCourses(institutionId);
            fetchAcademicYears(institutionId);
        }
    }, [institutionId]);

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        try {
            const doc = await classService.get(id as string);
            setSemester(doc.semester as unknown as string || "");
            setCourse(doc.course.$id || "");
            setAcademicYear(doc.academicYear.$id || "");
            setName(doc.name || "");
        } catch (error) {
            console.error("loadData Error:", error);
            Alert.alert("Error", "Failed to load class");
            router.back();
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async () => {
        Alert.alert("Delete", "Are you sure you want to delete this class?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await classService.delete(id as string);
                        if (institutionId) await fetchClasses(institutionId);
                        router.back();
                    } catch (error) {
                        Alert.alert("Error", "Failed to delete");
                    }
                }
            }
        ])
    }

    const handleSubmit = async () => {
        if (!semester || !course || !academicYear) {
            Alert.alert("Error", "Please fill in all required fields");
            return;
        }

        setSaving(true);
        try {
            await classService.update(id as string, {
                semester: Number(semester),
                course: course,
                name: name,
                academicYear: academicYear, // Assuming this is passed as ID string (relationship)
            });

            if (institutionId) await fetchClasses(institutionId);
            Alert.alert("Success", "Class updated successfully");
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to update class");
        } finally {
            setSaving(false);
        }
    };

    const courseOptions = courses.map(c => ({ label: `${c.name} (${c.code})`, value: c.$id }));
    const academicYearOptions = academicYears.map(ay => ({ label: ay.label, value: ay.$id }));

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
                title={isAdmin ? "Edit Class" : "Class Details"}
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

                    <FormSelect
                        label="Course"
                        value={course}
                        onChange={setCourse}
                        options={courseOptions}
                        placeholder="Select Course"
                        editable={isAdmin}
                    />

                    <FormSelect
                        label="Academic Year"
                        value={academicYear}
                        onChange={setAcademicYear}
                        options={academicYearOptions}
                        placeholder="Select Academic Year"
                        editable={isAdmin}
                    />

                    <View className="flex-row justify-between">
                        <View className="flex-1 ml-2">
                            <FormInput
                                label="Semester"
                                placeholder="1"
                                value={semester}
                                onChangeText={setSemester}
                                keyboardType="numeric"
                                editable={isAdmin}
                            />
                        </View>
                        <View className="flex-1 ml-2">
                            <FormInput
                                label="Name"
                                placeholder="eg. 1st year"
                                value={name}
                                onChangeText={setName}
                                editable={isAdmin}
                            />
                        </View>
                    </View>

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
