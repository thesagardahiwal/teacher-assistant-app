import { EmptyStateCard } from "@/components/common/EmptyStateCard";
import { useTeacherEligibility } from "@/store/hooks/useTeacherEligibility";
import { useTheme } from "@/store/hooks/useTheme";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";

interface Props {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const TeacherEligibilityGuard = ({ children, fallback }: Props) => {
    const { isEligible, isLoading, missingRequirements, refresh } = useTeacherEligibility();
    const { isDark } = useTheme();
    const router = useRouter();

    if (isEligible) {
        return <>{children}</>;
    }

    if (isLoading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    return (
        <View className={`flex-1 p-6 justify-center ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
            <EmptyStateCard
                title="Access Restricted"
                description="You are not assigned to any classes or subjects yet. Please contact your administrator to get assigned."
                icon="lock-closed-outline"
                variant="warning"
                actionLabel="Refresh Status"
                onAction={refresh}
            />
        </View>
    );
};
