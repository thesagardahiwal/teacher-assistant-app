import { useTheme } from "@/store/hooks/useTheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

interface AttendanceStatsCardProps {
    subjectName: string;
    className: string;
    classesTaken: number;
    lastTaken: string;
}

export function AttendanceStatsCard({ subjectName, className, classesTaken, lastTaken }: AttendanceStatsCardProps) {
    const { isDark } = useTheme();

    return (
        <View className={`p-4 mb-3 rounded-2xl border ${isDark ? "bg-dark-card border-dark-border" : "bg-white border-gray-100"} shadow-sm`}>
            <View className="flex-row justify-between items-start mb-2">
                <View>
                    <Text className={`font-bold text-lg mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                        {subjectName}
                    </Text>
                    <Text className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {className}
                    </Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${isDark ? "bg-blue-900/30" : "bg-blue-50"}`}>
                    <Text className={`text-xs font-bold ${isDark ? "text-blue-300" : "text-blue-700"}`}>
                        {classesTaken} Sessions
                    </Text>
                </View>
            </View>

            <View className={`h-[1px] w-full my-2 ${isDark ? "bg-gray-800" : "bg-gray-100"}`} />

            <View className="flex-row items-center">
                <MaterialCommunityIcons name="clock-outline" size={14} color={isDark ? "#9CA3AF" : "#6B7280"} />
                <Text className={`text-xs ml-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Last taken: {new Date(lastTaken).toLocaleDateString()}
                </Text>
            </View>
        </View>
    );
}
