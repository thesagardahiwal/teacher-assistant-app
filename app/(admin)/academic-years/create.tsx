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
    const { data: academicYears, fetchAcademicYears } = useAcademicYears();

    const [label, setLabel] = useState("");
    const [isCurrent, setIsCurrent] = useState(false);

    const [loading, setLoading] = useState(false);

    const validateLabel = (text: string) => {
        const regex = /^\d{4}-\d{4}$/;
        if (!regex.test(text)) {
            return "Format must be YYYY-YYYY (e.g., 2026-2027)";
        }
        const [start, end] = text.split("-").map(Number);
        if (end !== start + 1) {
            return "Second year must be exactly one year after the first (e.g., 2026-2027)";
        }
        return null;
    };

    const handleSubmit = async () => {
        if (!label || !institutionId) {
            showAlert("Error", "Please fill in all required fields");
            return;
        }

        const validationError = validateLabel(label);
        if (validationError) {
            showAlert("Invalid Format", validationError);
            return;
        }

        setLoading(true);
        try {
            // Frontend enforcement of Single Current Year
            if (isCurrent) {
                // Find existing current year
                const existingCurrent = academicYears.find(ay => ay.isCurrent);
                if (existingCurrent) {
                    // We need to unset it. using existing service.
                    // IMPORTANT: Verify we can update.
                    await academicYearService.update(existingCurrent.$id, { isCurrent: false });
                }
            }

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
                        label="Label (Format: YYYY-YYYY)"
                        placeholder="2026-2027"
                        value={label}
                        onChangeText={setLabel}
                    />
                    <Text className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        Example: 2026-2027. Next year must be consecutive.
                    </Text>

                    <View className="flex-row items-center justify-between py-4 mt-4 border-t border-gray-100 dark:border-gray-700">
                        <View>
                            <Text className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>Set as Current Year</Text>
                            {isCurrent && (
                                <Text className="text-xs text-yellow-600 mt-1">
                                    Warning: This will un-set the previous current year.
                                </Text>
                            )}
                        </View>
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
