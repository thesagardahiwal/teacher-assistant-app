import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface DashboardHeaderProps {
    user: {
        name: string;
        role?: string;
        $id?: string;
    } | null;
    isDark: boolean;
    subtitle?: string;
}

export function DashboardHeader({ user, isDark, subtitle }: DashboardHeaderProps) {
    const router = useRouter();

    // Helper to get initials
    const getInitials = (name?: string) => {
        return name ? name.charAt(0).toUpperCase() : "U";
    };

    return (
        <Animated.View
            entering={FadeInDown.delay(100).duration(500)}
            className="flex-row justify-between items-center px-6 py-6"
        >
            <View>
                <Text className="text-sm font-medium text-textSecondary dark:text-dark-textSecondary mb-1">
                    {subtitle || "Welcome back,"}
                </Text>
                <Text className="text-2xl font-bold text-textPrimary dark:text-dark-textPrimary">
                    {user?.name}
                </Text>
            </View>

            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push(user?.role === "ADMIN" ? "/(admin)/profile" : "/(teacher)/profile")}
                className="shadow-md shadow-primary/20"
            >
                <View className="w-12 h-12 rounded-full bg-primary dark:bg-dark-primary items-center justify-center border-2 border-white dark:border-dark-card">
                    <Text className="text-white font-bold text-xl">
                        {getInitials(user?.name)}
                    </Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}
