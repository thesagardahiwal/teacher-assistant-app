import { useTheme } from "@/store/hooks/useTheme";
import { TeacherAssignment } from "@/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface TeacherAssignmentCardProps {
    assignment: TeacherAssignment;
    index: number;
    onPress?: () => void;
    showTeacherName?: boolean;
}

export function TeacherAssignmentCard({ assignment, index, onPress, showTeacherName = false }: TeacherAssignmentCardProps) {
    const { isDark } = useTheme();

    return (
        <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={onPress ? 0.7 : 1}
                className={`p-4 mb-3 rounded-2xl border ${isDark ? "bg-dark-card border-dark-border" : "bg-white border-gray-100"} shadow-sm`}
            >
                <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1 mr-2">
                        <Text className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                            {assignment.subject?.name || "Unknown Subject"}
                        </Text>
                        <Text className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            {assignment.class?.name} • Sem {assignment.class?.semester}
                        </Text>
                    </View>
                    <View className={`px-2 py-1 rounded-lg ${isDark ? "bg-indigo-900/40" : "bg-indigo-50"}`}>
                        <Text className={`text-xs font-semibold ${isDark ? "text-indigo-300" : "text-indigo-600"}`}>
                            {assignment.class?.course?.code || "Code"}
                        </Text>
                    </View>
                </View>

                <View className={`h-[1px] w-full mb-3 ${isDark ? "bg-gray-800" : "bg-gray-100"}`} />

                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <MaterialCommunityIcons name="google-classroom" size={16} color={isDark ? "#9CA3AF" : "#6B7280"} />
                        <Text className={`ml-2 text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                            My Class
                        </Text>
                    </View>
                    {/* Placeholder for Schedule/Room which isn't in base Assignment type clearly yet, but can be added if backend supports */}
                    <View className="flex-row items-center">
                        <MaterialCommunityIcons name="clock-outline" size={14} color={isDark ? "#9CA3AF" : "#9CA3AF"} />
                        <Text className={`ml-1 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>View Details</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}
