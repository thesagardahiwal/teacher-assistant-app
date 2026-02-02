import { useTheme } from "@/store/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import Animated, { FadeInDown, SlideInDown } from "react-native-reanimated";

interface FormDatePickerProps {
    label: string;
    value: string;
    onChange: (date: string) => void;
    placeholder?: string;
    error?: string;
    required?: boolean;
    minDate?: string;
    delay?: number;
}

export const FormDatePicker = ({
    label,
    value,
    onChange,
    placeholder = "Select Date",
    error,
    required = false,
    minDate,
    delay = 0,
}: FormDatePickerProps) => {
    const { isDark } = useTheme();
    const [visible, setVisible] = useState(false);

    return (
        <Animated.View
            entering={FadeInDown.delay(delay).duration(400)}
            className="mb-4"
        >
            <View className="flex-row mb-2">
                <Text className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"} ml-1`}>
                    {label}
                </Text>
                {required && <Text className="text-red-500 ml-0.5">*</Text>}
            </View>

            <TouchableOpacity
                onPress={() => setVisible(true)}
                className={`w-full p-4 rounded-2xl border flex-row justify-between items-center ${error
                    ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                    : isDark
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    }`}
                activeOpacity={0.7}
            >
                <Text
                    className={`text-base ${value
                        ? isDark
                            ? "text-white"
                            : "text-gray-900"
                        : isDark
                            ? "text-gray-500"
                            : "text-gray-400"
                        }`}
                >
                    {value || placeholder}
                </Text>
                <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={isDark ? "#9CA3AF" : "#6B7280"}
                />
            </TouchableOpacity>

            {error && (
                <Animated.Text
                    entering={FadeInDown}
                    className="text-xs text-red-500 mt-1.5 ml-1"
                >
                    {error}
                </Animated.Text>
            )}

            <Modal transparent visible={visible} animationType="fade" onRequestClose={() => setVisible(false)}>
                <TouchableWithoutFeedback onPress={() => setVisible(false)}>
                    <View className="flex-1 bg-black/60 justify-center px-4">
                        <TouchableWithoutFeedback>
                            <Animated.View
                                entering={SlideInDown.springify().damping(15)}
                                className={`rounded-3xl overflow-hidden ${isDark ? "bg-gray-900" : "bg-white"}`}
                            >
                                <View className={`p-4 border-b ${isDark ? "border-gray-800" : "border-gray-100"} flex-row justify-between items-center`}>
                                    <Text className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                                        Select Date
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => setVisible(false)}
                                        className={`p-2 rounded-full ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
                                    >
                                        <Ionicons name="close" size={20} color={isDark ? "#FFF" : "#000"} />
                                    </TouchableOpacity>
                                </View>

                                <Calendar
                                    onDayPress={(day: DateData) => {
                                        onChange(day.dateString);
                                        setVisible(false);
                                    }}
                                    minDate={minDate}
                                    markedDates={{
                                        [value]: { selected: true, selectedColor: "#2563EB" }
                                    }}
                                    theme={{
                                        calendarBackground: isDark ? "#111827" : "#ffffff",
                                        textSectionTitleColor: isDark ? "#9ca3af" : "#b6c1cd",
                                        selectedDayBackgroundColor: "#2563EB",
                                        selectedDayTextColor: "#ffffff",
                                        todayTextColor: "#2563EB",
                                        dayTextColor: isDark ? "#ffffff" : "#2d4150",
                                        textDisabledColor: isDark ? "#4b5563" : "#d9e1e8",
                                        arrowColor: "#2563EB",
                                        monthTextColor: isDark ? "#ffffff" : "#2d4150",
                                        textMonthFontWeight: 'bold',
                                    }}
                                />
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </Animated.View>
    );
};
