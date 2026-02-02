import { useTheme } from "@/store/hooks/useTheme";
import { Student } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Switch, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface StudentAttendanceCardProps {
    student: Student; // or any object having name and rollNumber
    isPresent: boolean;
    onToggle: () => void; // Used for tap interaction
    onSwitchChange?: (val: boolean) => void; // Used for Switch interaction
    mode: "selection" | "switch"; // 'selection' for marking, 'switch' for details view
    index?: number;
    onLongPress?: () => void;
}

export function StudentAttendanceCard({
    student,
    isPresent,
    onToggle,
    onSwitchChange,
    mode,
    index = 0,
    onLongPress
}: StudentAttendanceCardProps) {
    const { isDark } = useTheme();

    const Content = (
        <View className="flex-row items-center">
            <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isPresent
                    ? (isDark ? "bg-green-900/40" : "bg-green-100")
                    : (isDark ? "bg-red-900/40" : "bg-red-100")
                }`}>
                <Text className={`font-bold ${isPresent
                        ? (isDark ? "text-green-400" : "text-green-700")
                        : (isDark ? "text-red-400" : "text-red-700")
                    }`}>
                    {student.name.charAt(0)}
                </Text>
            </View>

            <View className="flex-1">
                <Text className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>
                    {student.name}
                </Text>
                <Text className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Roll No: {student.rollNumber}
                </Text>
            </View>

            {mode === "selection" && (
                <View className={`w-8 h-8 rounded-full items-center justify-center ${isPresent
                        ? (isDark ? "bg-green-500" : "bg-green-500")
                        : (isDark ? "bg-red-500/20" : "bg-red-100")
                    }`}>
                    <Ionicons
                        name={isPresent ? "checkmark" : "close"}
                        size={18}
                        color={isPresent ? "white" : (isDark ? "#EF4444" : "#DC2626")}
                    />
                </View>
            )}

            {mode === "switch" && onSwitchChange && (
                <Switch
                    value={isPresent}
                    onValueChange={onSwitchChange}
                    trackColor={{ false: "#EF4444", true: "#22C55E" }}
                    thumbColor={"#FFFFFF"}
                />
            )}
        </View>
    );

    const Container = mode === "selection" ? TouchableOpacity : View;

    return (
        <Animated.View entering={FadeInDown.delay(index * 20).springify()}>
            <Container
                onPress={mode === "selection" ? onToggle : undefined}
                onLongPress={onLongPress}
                activeOpacity={0.7}
                className={`p-3 mb-2 rounded-2xl border ${mode === "selection"
                        ? (isPresent
                            ? (isDark ? "bg-gray-800 border-green-500/50" : "bg-white border-green-200")
                            : (isDark ? "bg-gray-800 border-red-500/50" : "bg-red-50 border-red-200"))
                        : (isDark ? "bg-dark-card border-dark-border" : "bg-white border-gray-100")
                    }`}
            >
                {Content}
            </Container>
        </Animated.View>
    );
}
