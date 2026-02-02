import { useTheme } from "@/store/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import RNDateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface FormTimePickerProps {
    label: string;
    value: string; // HH:mm
    onChange: (value: string) => void;
    minTime?: string; // HH:mm
    placeholder?: string;
    error?: string;
    required?: boolean;
    delay?: number;
    editable?: boolean;
}

export const FormTimePicker = ({
    label,
    value,
    onChange,
    minTime,
    placeholder = "Select Time",
    error,
    required = false,
    delay = 0,
    editable = true,
}: FormTimePickerProps) => {
    const { isDark } = useTheme();
    const [showPicker, setShowPicker] = useState(false);

    // Helper: Convert "HH:mm" string to Date object
    const timeStringToDate = (timeString: string): Date => {
        const d = new Date();
        if (!timeString) return d;
        const [hours, minutes] = timeString.split(":").map(Number);
        d.setHours(hours);
        d.setMinutes(minutes);
        d.setSeconds(0);
        d.setMilliseconds(0);
        return d;
    };

    // Helper: Convert Date object to "HH:mm" string
    const dateToTimeString = (date: Date): string => {
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
    };

    const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (Platform.OS === "android") {
            setShowPicker(false);
        }

        if (selectedDate) {
            onChange(dateToTimeString(selectedDate));
        }
    };

    const currentDate = timeStringToDate(value);
    const minDate = minTime ? timeStringToDate(minTime) : undefined;

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
                onPress={editable ? () => setShowPicker(true) : undefined}
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
                    name="time-outline"
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

            {showPicker && (
                <RNDateTimePicker
                    value={currentDate}
                    mode="time"
                    is24Hour={true}
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleChange}
                    minimumDate={minDate}
                />
            )}
        </Animated.View>
    );
};
