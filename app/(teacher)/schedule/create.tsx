import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ScheduleForm } from "@/components/forms/ScheduleForm";
import { useAuth } from "@/store/hooks/useAuth";
import { useTheme } from "@/store/hooks/useTheme";
import { showAlert } from "@/utils/alert";
import { useSafeBack } from "@/utils/navigation";
import { useInstitutionId } from "@/utils/useInstitutionId";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, View } from "react-native";

export default function TeacherCreateSchedule() {
    const { goBack } = useSafeBack();
    const { isDark } = useTheme();
    const { user } = useAuth();
    const institutionId = useInstitutionId();
    const [refreshing, setRefreshing] = useState(false);
    const [refreshToken, setRefreshToken] = useState(0);

    const handleSuccess = () => {
        showAlert("Success", "Schedule created successfully", [
            { text: "OK", onPress: goBack }
        ]);
    };

    if (!institutionId || !user) return null;

    const onRefresh = () => {
        setRefreshing(true);
        setRefreshToken((t) => t + 1);
    };

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
                    contentContainerStyle={{ paddingBottom: 120 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={isDark ? "#ffffff" : "#2563EB"}
                        />
                    }
                >
                    <View className={`p-6 rounded-3xl mt-2 mb-6 border ${isDark ? "bg-dark-card border-dark-border" : "bg-white border-border"} shadow-sm`}>
                        <ScheduleForm
                            institutionId={institutionId}
                            initialTeacherId={user.$id}
                            onSuccess={handleSuccess}
                            refreshToken={refreshToken}
                            onRefreshed={() => setRefreshing(false)}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
