import { FormInput } from "@/components/admin/ui/FormInput";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { academicYearService } from "@/services/academicYear.service";
import { useAcademicYears } from "@/store/hooks/useAcademicYears";
import { useTheme } from "@/store/hooks/useTheme";
import { showAlert } from "@/utils/alert";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function EditAcademicYear() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();
    const { fetchAcademicYears } = useAcademicYears();

    const [label, setLabel] = useState("");
    const [isCurrent, setIsCurrent] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        try {
            const doc = await academicYearService.get(id as string);
            setLabel(doc.label);
            setIsCurrent(doc.isCurrent);
        } catch (error) {
            showAlert("Error", "Failed to load academic year");
            router.back();
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async () => {
        showAlert("Delete", "Are you sure you want to delete this academic year?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await academicYearService.delete(id as string);
                        if (institutionId) await fetchAcademicYears(institutionId);
                        router.back();
                    } catch (error) {
                        showAlert("Error", "Failed to delete");
                    }
                }
            }
        ])
    }

    const handleSubmit = async () => {
        if (!label) {
            showAlert("Error", "Please fill in all required fields");
            return;
        }

        setSaving(true);
        try {
            await academicYearService.update(id as string, {
                label,
                isCurrent,
            });

            if (institutionId) await fetchAcademicYears(institutionId);
            showAlert("Success", "Academic Year updated successfully");
        } catch (error: any) {
            showAlert("Error", error.message || "Failed to update academic year");
        } finally {
            setSaving(false);
        }
    };

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
                title="Edit Academic Year"
                rightAction={
                    <TouchableOpacity onPress={handleDelete} className="bg-red-100 dark:bg-red-900 p-2 rounded-full">
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                }
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                <View className={`p-6 rounded-2xl mb-6 ${isDark ? "bg-gray-800" : "bg-white"}`}>
                    <FormInput
                        label="Label (e.g. 2023-2024)"
                        placeholder="2023-2024"
                        value={label}
                        onChangeText={setLabel}
                    />

                    <View className="flex-row items-center justify-between py-4 mt-2">
                        <Text className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>Set as Current Year</Text>
                        <Switch
                            value={isCurrent}
                            onValueChange={setIsCurrent}
                            trackColor={{ false: "#767577", true: "#3b82f6" }}
                            thumbColor={isCurrent ? "#ffffff" : "#f4f3f4"}
                        />
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
