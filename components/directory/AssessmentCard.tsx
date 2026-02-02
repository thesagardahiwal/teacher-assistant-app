import { useTheme } from "@/store/hooks/useTheme";
import { Assessment } from "@/types/assessment.type";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface AssessmentCardProps {
    assessment: Assessment;
    index: number;
    onPress: () => void;
}

export function AssessmentCard({ assessment, index, onPress }: AssessmentCardProps) {
    const { isDark } = useTheme();

    return (
        <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.7}
                className={`p-4 mb-3 rounded-2xl border ${isDark ? "bg-dark-card border-dark-border" : "bg-white border-gray-100"} shadow-sm`}
            >
                <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1 mr-2">
                        <View className="flex-row items-center mb-1">
                            <View className={`px-2 py-0.5 rounded-md mr-2 ${isDark ? "bg-blue-900/30" : "bg-blue-50"}`}>
                                <Text className={`text-xs font-bold ${isDark ? "text-blue-300" : "text-blue-700"}`}>
                                    {assessment.type}
                                </Text>
                            </View>
                            <Text className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                {assessment.subject?.name}
                            </Text>
                        </View>
                        <Text className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                            {assessment.title}
                        </Text>
                    </View>

                    <View className={`px-3 py-1 rounded-full ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                        <Text className={`text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            {assessment.class?.name}
                        </Text>
                    </View>
                </View>

                <View className={`h-[1px] w-full mb-3 ${isDark ? "bg-gray-800" : "bg-gray-100"}`} />

                <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                        <Ionicons name="calendar-outline" size={14} color={isDark ? "#9CA3AF" : "#6B7280"} />
                        <Text className={`text-xs ml-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            Due: {new Date(assessment.dueDate || assessment.$createdAt).toLocaleDateString()}
                        </Text>
                    </View>

                    <View className="flex-row items-center">
                        <MaterialCommunityIcons name="trophy-outline" size={14} color={isDark ? "#FBBF24" : "#D97706"} />
                        <Text className={`text-xs ml-1 font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            Max: {assessment.maxMarks}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}
