import { useTheme } from "@/store/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface ClassCardProps {
    classItem: any;
    onPress?: () => void;
    index: number;
    readonly?: boolean;
}

export function ClassCard({ classItem, onPress, index, readonly = false }: ClassCardProps) {
    const { isDark } = useTheme();

    return (
        <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
            <TouchableOpacity
                onPress={onPress}
                disabled={!onPress}
                activeOpacity={onPress ? 0.7 : 1}
                className={`flex-row items-center p-4 mb-3 rounded-2xl border ${isDark ? "bg-dark-card border-dark-border" : "bg-white border-gray-100"} shadow-sm`}
            >
                {/* Year Icon/Badge */}
                <View className={`w-12 h-12 rounded-xl items-center justify-center mr-4 border ${isDark ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-100"}`}>
                    <Text className={`text-sm font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                        Sem {classItem.semester}
                    </Text>
                </View>

                {/* Info */}
                <View className="flex-1">
                    <Text className={`text-base font-bold mb-0.5 ${isDark ? "text-white" : "text-gray-900"}`}>
                        {classItem.name || `Class ${classItem.$id.substring(0, 4)}`}
                    </Text>
                    <Text className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {classItem.course?.name} • Year {classItem.academicYear?.label}
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
