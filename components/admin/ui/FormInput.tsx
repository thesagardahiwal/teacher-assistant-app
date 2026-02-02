import { useTheme } from "@/store/hooks/useTheme";
import React, { useState } from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface FormInputProps extends TextInputProps {
    label: string;
    error?: string;
    required?: boolean;
    delay?: number;
}

export const FormInput = ({ label, error, required, style, delay = 0, ...props }: FormInputProps) => {
    const { isDark } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

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
            <TextInput
                placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`w-full p-4 rounded-2xl border ${error
                    ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                    : isFocused
                        ? "border-primary dark:border-blue-500 bg-white dark:bg-gray-800"
                        : isDark
                            ? "bg-gray-800 border-gray-700 text-white"
                            : "bg-white border-gray-200 text-gray-900"
                    } ${isFocused ? "shadow-sm shadow-primary/20" : ""}`}
                style={{ fontSize: 16 }}
                {...props}
            />
            {error && (
                <Animated.Text
                    entering={FadeInDown}
                    className="text-xs text-red-500 mt-1.5 ml-1"
                >
                    {error}
                </Animated.Text>
            )}
        </Animated.View>
    );
};
