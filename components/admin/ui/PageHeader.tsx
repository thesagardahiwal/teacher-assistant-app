import { useTheme } from "@/store/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    rightAction?: React.ReactNode;
    showBack?: boolean;
    onBack?: () => void;
}

export const PageHeader = ({ title, subtitle, rightAction, showBack = true, onBack }: PageHeaderProps) => {
    const { isDark } = useTheme();

    return (
        <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center flex-1">
                {showBack && (
                    <Link href=".." asChild>
                        <TouchableOpacity
                            className="mr-3 p-2 rounded-full bg-gray-100 dark:bg-gray-800"
                        >
                            <Ionicons
                                name="arrow-back"
                                size={20}
                                color={isDark ? "white" : "black"}
                            />
                        </TouchableOpacity>
                    </Link>
                )}
                <View className="flex-1">
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                        {title}
                    </Text>
                    {subtitle && (
                        <Text className="text-sm text-gray-500 dark:text-gray-400">
                            {subtitle}
                        </Text>
                    )}
                </View>
            </View>
            {rightAction && <View>{rightAction}</View>}
        </View>
    );
};
