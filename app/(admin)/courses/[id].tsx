import { FormInput } from "@/components/admin/ui/FormInput";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { courseService } from "@/services/course.service";
import { useAuth } from "@/store/hooks/useAuth";
import { useCourses } from "@/store/hooks/useCourses";
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

export default function EditCourse() {
    const router = useRouter();
    const { goBack } = useSafeBack();
    const { id } = useLocalSearchParams();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();
    const { user } = useAuth();
    const { fetchCourses } = useCourses();

    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [durationYears, setDurationYears] = useState("3");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        try {
            const doc = await courseService.get(id as string);
            setName(doc.name);
            setCode(doc.code);
            setDurationYears(doc.durationYears.toString());
        } catch (error) {
            showAlert("Error", "Failed to load course");
            goBack();
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async () => {
        showAlert("Delete", "Are you sure you want to delete this course?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await courseService.delete(id as string);
                        if (institutionId) await fetchCourses(institutionId);
                        goBack();
                    } catch (error) {
                        showAlert("Error", "Failed to delete");
                    }
                }
            }
        ])
    }

    const handleSubmit = async () => {
        if (!name || !code || !durationYears || !institutionId) {
            showAlert("Error", "Please fill in all required fields");
            return;
        }

        setSaving(true);
        try {
            await courseService.update(id as string, {
                name,
                code,
                durationYears: parseInt(durationYears),
            });

            await fetchCourses(institutionId);
            showAlert("Success", "Course updated successfully");
        } catch (error: any) {
            showAlert("Error", error.message || "Failed to update course");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? "bg-dark-background" : "bg-background"}`}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        )
    }


    const isAdmin = user?.role === "ADMIN";

    return (
        <View className={`flex-1 px-6 pt-6 ${isDark ? "bg-dark-background" : "bg-background"}`}>
            <PageHeader
                title={isAdmin ? "Edit Course" : "Course Details"}
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
                        label="Course Name"
                        placeholder="Computer Science"
                        value={name}
                        onChangeText={setName}
                        editable={isAdmin}
                    />

                    <FormInput
                        label="Course Code"
                        placeholder="CS"
                        value={code}
                        onChangeText={setCode}
                        editable={isAdmin}
                    />

                    <FormInput
                        label="Duration (Years)"
                        placeholder="3"
                        value={durationYears}
                        onChangeText={setDurationYears}
                        keyboardType="numeric"
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
