import { FormInput } from "@/components/admin/ui/FormInput";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { academicYearService } from "@/services/academicYear.service";
import { useAcademicYears } from "@/store/hooks/useAcademicYears";
import { useAuth } from "@/store/hooks/useAuth";
import { useTheme } from "@/store/hooks/useTheme";
import { showAlert } from "@/utils/alert";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View
} from "react-native";

export default function CreateAcademicYear() {
    const router = useRouter();
    const { isDark } = useTheme();
    let institutionId = useInstitutionId();
    const { user } = useAuth();
    if (user?.institution) institutionId = typeof user.institution === 'string' ? user.institution : user.institution.$id;
    const { fetchAcademicYears } = useAcademicYears();

    const [label, setLabel] = useState("");
    const [isCurrent, setIsCurrent] = useState(false);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!label || !institutionId) {
            showAlert("Error", "Please fill in all required fields");
            return;
        }

        setLoading(true);
        try {
            await academicYearService.create({
                label,
                isCurrent,
                institution: institutionId,
            });

            await fetchAcademicYears(institutionId);
            showAlert("Success", "Academic Year created successfully", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error: any) {
            showAlert("Error", error.message || "Failed to create academic year");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className={`flex-1 px-6 pt-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
            <PageHeader title="New Academic Year" />

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
                    disabled={loading}
                    className={`py-4 rounded-xl items-center mb-10 ${loading ? "bg-blue-400" : "bg-blue-600"
                        }`}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Create Academic Year</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
