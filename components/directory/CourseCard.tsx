import { useTheme } from "@/store/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface CourseCardProps {
    course: any;
    onPress?: () => void;
    index: number;
    readonly?: boolean;
}

export function CourseCard({ course, onPress, index, readonly = false }: CourseCardProps) {
    const { isDark } = useTheme();

    return (
        <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
            <TouchableOpacity
                onPress={onPress}
                disabled={!onPress}
                activeOpacity={onPress ? 0.7 : 1}
                className={`flex-row items-center p-4 mb-3 rounded-2xl border ${isDark ? "bg-dark-card border-dark-border" : "bg-white border-gray-100"} shadow-sm`}
            >
                {/* Icon / Avatar Substitute */}
                <View className={`w-12 h-12 rounded-xl items-center justify-center mr-4 border ${isDark ? "bg-orange-900/20 border-orange-800" : "bg-orange-50 border-orange-100"}`}>
                    <Text className={`text-lg font-bold ${isDark ? "text-orange-400" : "text-orange-600"}`}>
                        {course.code?.substring(0, 2).toUpperCase() || "CO"}
                    </Text>
                </View>

                {/* Info */}
                <View className="flex-1">
                    <Text className={`text-base font-bold mb-0.5 ${isDark ? "text-white" : "text-gray-900"}`}>
                        {course.name}
                    </Text>
                    <Text className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        Code: {course.code} • {course.durationYears} Years
                    </Text>
                </View>

                {/* Right Action */}
                {!readonly && (
                    <Ionicons name="chevron-forward" size={16} color={isDark ? "#4B5563" : "#9CA3AF"} />
                )}
            </TouchableOpacity>
        </Animated.View>
    );
}
