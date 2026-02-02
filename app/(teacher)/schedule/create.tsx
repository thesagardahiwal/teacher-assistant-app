import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ScheduleForm } from "@/components/forms/ScheduleForm";
import { useAuth } from "@/store/hooks/useAuth";
import { useTheme } from "@/store/hooks/useTheme";
import { showAlert } from "@/utils/alert";
import { useSafeBack } from "@/utils/navigation";
import { useInstitutionId } from "@/utils/useInstitutionId";
import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

export default function TeacherCreateSchedule() {
    const { goBack } = useSafeBack();
    const { isDark } = useTheme();
    const { user } = useAuth();
    const institutionId = useInstitutionId();

    const handleSuccess = () => {
        showAlert("Success", "Schedule created successfully", [
            { text: "OK", onPress: goBack }
        ]);
    };

    if (!institutionId || !user) return null;

    return (
        <View className={`flex-1 ${isDark ? "bg-dark-background" : "bg-background"}`}>
            <View className="px-6 pt-6 pb-2">
                <PageHeader title="Add New Schedule" showBack />
            </View>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1 px-6"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    <View className={`p-6 rounded-3xl mt-2 mb-6 border ${isDark ? "bg-dark-card border-dark-border" : "bg-white border-border"} shadow-sm`}>
                        <ScheduleForm
                            institutionId={institutionId}
                            initialTeacherId={user.$id}
                            onSuccess={handleSuccess}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
