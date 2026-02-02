import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface TeacherCardProps {
    teacher: any;
    onPress: () => void;
    index: number;
    isDark: boolean;
    disabled?: boolean;
}

export function TeacherCard({ teacher, onPress, index, isDark, disabled }: TeacherCardProps) {
    return (
        <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled}
                activeOpacity={0.7}
                className={`p-4 mb-3 rounded-2xl border flex-row items-center justify-between ${isDark
                    ? "bg-dark-card border-dark-border shadow-black/20"
                    : "bg-white border-gray-100 shadow-sm"
                    } shadow-md`}
            >
                <View className="flex-row items-center flex-1">
                    {/* Avatar */}
                    <View className={`w-12 h-12 rounded-full mr-4 items-center justify-center ${isDark ? "bg-blue-900/30" : "bg-blue-50"
                        }`}>
                        <Text className={`text-lg font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                            {teacher.name?.charAt(0).toUpperCase()}
                        </Text>
                    </View>

                    <View className="flex-1">
                        <Text className={`text-base font-bold mb-0.5 ${isDark ? "text-dark-textPrimary" : "text-textPrimary"}`}>
                            {teacher.name}
                        </Text>
                        <Text className={`text-sm ${isDark ? "text-dark-textSecondary" : "text-textSecondary"}`}>
                            {teacher.email}
                        </Text>
                        {(teacher.department || teacher.designation) && (
                            <View className="flex-row items-center mt-1">
                                <Text className={`text-xs ${isDark ? "text-dark-muted" : "text-muted"}`}>
                                    {teacher.designation} {teacher.designation && teacher.department ? "•" : ""} {teacher.department}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
                {!disabled && (
                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={isDark ? "#6B7280" : "#9CA3AF"}
                    />
                )}
            </TouchableOpacity>
        </Animated.View>
    );
}
