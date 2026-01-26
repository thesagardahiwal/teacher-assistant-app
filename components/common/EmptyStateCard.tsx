import { useTheme } from "@/store/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface EmptyStateCardProps {
    title: string;
    description: string;
    icon?: keyof typeof Ionicons.glyphMap;
    actionLabel?: string;
    onAction?: () => void;
    variant?: "info" | "warning" | "error" | "success";
}

export const EmptyStateCard = ({
    title,
    description,
    icon = "alert-circle-outline",
    actionLabel,
    onAction,
    variant = "info"
}: EmptyStateCardProps) => {
    const { isDark } = useTheme();

    const getColors = () => {
        switch (variant) {
            case "warning":
                return {
                    bg: isDark ? "bg-amber-900/20" : "bg-amber-50",
                    border: isDark ? "border-amber-800" : "border-amber-200",
                    icon: isDark ? "#F59E0B" : "#D97706",
                    text: isDark ? "text-amber-200" : "text-amber-800",
                    desc: isDark ? "text-amber-300" : "text-amber-700",
                    btn: "bg-amber-600",
                };
            case "error":
                return {
                    bg: isDark ? "bg-red-900/20" : "bg-red-50",
                    border: isDark ? "border-red-800" : "border-red-200",
                    icon: isDark ? "#EF4444" : "#DC2626",
                    text: isDark ? "text-red-200" : "text-red-800",
                    desc: isDark ? "text-red-300" : "text-red-700",
                    btn: "bg-red-600",
                };
            default: // info
                return {
                    bg: isDark ? "bg-blue-900/20" : "bg-blue-50",
                    border: isDark ? "border-blue-800" : "border-blue-200",
                    icon: isDark ? "#3B82F6" : "#2563EB",
                    text: isDark ? "text-blue-200" : "text-blue-800",
                    desc: isDark ? "text-blue-300" : "text-blue-700",
                    btn: "bg-blue-600",
                };
        }
    };

    const colors = getColors();

    return (
        <View className={`p-6 rounded-2xl border ${colors.bg} ${colors.border} items-center`}>
            <View className={`w-16 h-16 rounded-full mb-4 items-center justify-center bg-white/50 dark:bg-black/20`}>
                <Ionicons name={icon} size={32} color={colors.icon} />
            </View>
            <Text className={`text-xl font-bold mb-2 text-center ${colors.text}`}>
                {title}
            </Text>
            <Text className={`text-base text-center mb-6 leading-6 ${colors.desc}`}>
                {description}
            </Text>

            {actionLabel && onAction && (
                <TouchableOpacity
                    onPress={onAction}
                    className={`px-6 py-3 rounded-xl ${colors.btn} shadow-sm`}
                >
                    <Text className="text-white font-bold">{actionLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};
