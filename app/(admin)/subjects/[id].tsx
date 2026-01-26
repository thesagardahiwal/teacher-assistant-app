import { FormInput } from "@/components/admin/ui/FormInput";
import { FormSelect } from "@/components/admin/ui/FormSelect";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { subjectService } from "@/services";
import { useCourses } from "@/store/hooks/useCourses";
import { useSubjects } from "@/store/hooks/useSubjects";
import { useTheme } from "@/store/hooks/useTheme";
import { showAlert } from "@/utils/alert";
import { useSafeBack } from "@/utils/navigation";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function EditSubject() {
    const router = useRouter();
    const { goBack } = useSafeBack();
    const { id } = useLocalSearchParams();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();

    const { fetchSubjects } = useSubjects();
    const { data: courses, fetchCourses } = useCourses();

    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [course, setCourse] = useState("");
    const [semester, setSemester] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (institutionId) {
            fetchCourses(institutionId);
        }
    }, [institutionId]);

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        try {
            const doc = await subjectService.get(id as string);
            setName(doc.name);
            setCode(doc.code);
            setSemester(doc.semester.toString());
            // Handle course being either an object (if expanded) or a string ID
            const courseId = typeof doc.course === 'object' ? doc.course?.$id : doc.course;
            setCourse(courseId || "");
        } catch (error) {
            showAlert("Error", "Failed to load subject");
            goBack();
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async () => {
        showAlert("Delete", "Are you sure you want to delete this subject?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await subjectService.delete(id as string);
                        if (institutionId) await fetchSubjects(institutionId);
                        goBack();
                    } catch (error) {
                        showAlert("Error", "Failed to delete");
                    }
                }
            }
        ])
    }

    const handleSubmit = async () => {
        if (!name || !code || !course || !semester) {
            showAlert("Error", "Please fill in all required fields");
            return;
        }

        setSaving(true);
        try {
            await subjectService.update(id as string, {
                name,
                code,
                course,
                semester: Number(semester),
            });

            if (institutionId) await fetchSubjects(institutionId);
            showAlert("Success", "Subject updated successfully");
        } catch (error: any) {
            showAlert("Error", error.message || "Failed to update subject");
        } finally {
            setSaving(false);
        }
    };

    const courseOptions = courses.map(c => ({ label: `${c.name} (${c.code})`, value: c.$id }));

    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        )
    }

    return (
        <View className={`flex-1 px-6 pt-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
            <PageHeader
                title="Edit Subject"
                rightAction={
                    <TouchableOpacity onPress={handleDelete} className="bg-red-100 dark:bg-red-900 p-2 rounded-full">
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
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
                    />

                    <FormInput
                        label="Subject Name"
                        placeholder="Data Structures"
                        value={name}
                        onChangeText={setName}
                    />

                    <FormInput
                        label="Subject Code"
                        placeholder="CS101"
                        value={code}
                        onChangeText={setCode}
                    />

                    <View className="flex-row justify-between">
                        <View className="flex-1 ml-2">
                            <FormInput
                                label="Semester"
                                placeholder="1"
                                value={semester}
                                onChangeText={setSemester}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                </View>

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
            </ScrollView>
        </View>
    );
}
