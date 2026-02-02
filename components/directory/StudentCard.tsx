import { useTheme } from "@/store/hooks/useTheme";
import { Student } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface StudentCardProps {
    student: Student;
    onPress: () => void;
    index: number;
}

export function StudentCard({ student, onPress, index }: StudentCardProps) {
    const { isDark } = useTheme();

    return (
        <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
            <TouchableOpacity
                onPress={onPress}
                className={`flex-row items-center p-4 mb-3 rounded-2xl border ${isDark ? "bg-dark-card border-dark-border" : "bg-white border-gray-100"} shadow-sm`}
            >
                {/* Avatar */}
                <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 border ${isDark ? "bg-indigo-900/30 border-indigo-800" : "bg-indigo-50 border-indigo-100"}`}>
                    <Text className={`text-lg font-bold ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
                        {student.name?.charAt(0).toUpperCase()}
                    </Text>
                </View>

                {/* Info */}
                <View className="flex-1">
                    <Text className={`text-base font-bold mb-0.5 ${isDark ? "text-white" : "text-gray-900"}`}>
                        {student.name}
                    </Text>
                    <Text className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        Roll: {student.rollNumber} • {student.email}
                    </Text>
                    {student.course && (
                        <Text className={`text-[10px] mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                            {student.course.code}
                        </Text>
                    )}
                </View>

                {/* Right Action / Status */}
                <View className="items-end">
                    {student.class && (
                        <View className={`px-2 py-1 rounded-lg mb-2 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                            <Text className={`text-[10px] font-bold ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                {student.class.name}
                            </Text>
                        </View>
                    )}
                    <Ionicons name="chevron-forward" size={16} color={isDark ? "#4B5563" : "#9CA3AF"} />
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}
