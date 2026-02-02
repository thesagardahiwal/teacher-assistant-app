import { useTheme } from "@/store/hooks/useTheme";
import { Attendance } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface AttendanceSessionCardProps {
    session: Attendance;
    index: number;
    onPress: () => void;
}

export function AttendanceSessionCard({ session, index, onPress }: AttendanceSessionCardProps) {
    const { isDark } = useTheme();
    const date = new Date(session.date);

    return (
        <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.7}
                className={`p-4 mb-3 rounded-2xl border flex-row items-center justify-between shadow-sm ${isDark ? "bg-dark-card border-dark-border" : "bg-white border-gray-100"
                    }`}
            >
                <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                        <View className={`w-8 h-8 rounded-full items-center justify-center mr-2 ${isDark ? "bg-blue-900/30" : "bg-blue-50"}`}>
                            <Ionicons name="calendar-outline" size={16} color="#3B82F6" />
                        </View>
                        <Text className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>
                            {session.class?.name}
                        </Text>
                    </View>

                    <Text className={`text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        {session.subject?.name}
                    </Text>

                    <Text className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>

                <View className="flex-row items-center">
                    <Text className={`text-xs font-medium mr-1 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                        Details
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={isDark ? "#60A5FA" : "#3B82F6"} />
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}
