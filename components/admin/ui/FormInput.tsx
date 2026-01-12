import { useTheme } from "@/store/hooks/useTheme";
import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface FormInputProps extends TextInputProps {
    label: string;
    error?: string;
}

export const FormInput = ({ label, error, style, ...props }: FormInputProps) => {
    const { isDark } = useTheme();

    return (
        <View className="mb-4">
            <Text className={`text-sm font-medium mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                {label}
            </Text>
            <TextInput
                placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                className={`w-full p-3 rounded-xl border ${error
                        ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                        : isDark
                            ? "bg-gray-800 border-gray-700 text-white"
                            : "bg-white border-gray-200 text-gray-900"
                    }`}
                {...props}
            />
            {error && <Text className="text-xs text-red-500 mt-1">{error}</Text>}
        </View>
    );
};
