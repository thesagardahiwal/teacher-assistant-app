import { useTheme } from "@/store/hooks/useTheme";
import { ClassSchedule } from "@/types/schedule.type";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface ScheduleCardProps {
    schedule: ClassSchedule;
    index: number;
    onPress?: () => void;
    showDay?: boolean;
}

export function ScheduleCard({ schedule, index, onPress, showDay = true }: ScheduleCardProps) {
    const { isDark } = useTheme();

    return (
        <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
            <TouchableOpacity
                onPress={onPress}
                disabled={!onPress}
                activeOpacity={onPress ? 0.7 : 1}
                className={`p-4 mb-3 rounded-2xl border ${isDark ? "bg-dark-card border-dark-border" : "bg-white border-gray-100"} shadow-sm`}
            >
                <View className="flex-row justify-between items-start">
                    {/* Time / Day Column */}
                    <View className="mr-4 items-center">
                        {showDay && (
                            <View className={`px-2 py-1 rounded-lg mb-2 ${isDark ? "bg-blue-900/30" : "bg-blue-50"}`}>
                                <Text className={`text-xs font-bold ${isDark ? "text-blue-300" : "text-blue-700"}`}>
                                    {schedule.dayOfWeek}
                                </Text>
                            </View>
                        )}
                        <Text className={`text-sm font-semibold ${isDark ? "text-gray-100" : "text-gray-900"}`}>
                            {schedule.startTime}
                        </Text>
                        <Text className={`text-xs text-center ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                            {schedule.endTime}
                        </Text>
                    </View>

                    {/* Vertical Divider */}
                    <View className={`w-[1px] h-full mx-2 ${isDark ? "bg-gray-800" : "bg-gray-100"}`} />

                    {/* Info Column */}
                    <View className="flex-1 ml-2 py-0.5">
                        <Text className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                            {schedule.subject?.name || "No Subject"}
                        </Text>
                        <Text className={`text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            {schedule.class?.name || "Class N/A"} • {schedule.teacher?.name || "Unknown Teacher"}
                        </Text>

                        {/* Room/Meta info */}
                        <View className="flex-row items-center mt-1">
                            <View className={`flex-row items-center px-2 py-1 rounded-md ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                                <Ionicons name="location-outline" size={12} color={isDark ? "#9CA3AF" : "#6B7280"} />
                                <Text className={`text-xs ml-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                    Room 101
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Action Icon */}
                    {onPress && (
                        <View className="justify-center h-full pl-2">
                            <Ionicons name="chevron-forward" size={18} color={isDark ? "#4B5563" : "#9CA3AF"} />
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}
