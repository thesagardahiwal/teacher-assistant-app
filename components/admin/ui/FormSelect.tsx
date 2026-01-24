import { useTheme } from "@/store/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

interface Option {
    label: string;
    value: string;
}

interface FormSelectProps {
    label: string;
    value: string;
    options: Option[];
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
    editable?: boolean;
    required?: boolean;
}

export const FormSelect = ({
    label,
    value,
    options,
    onChange,
    placeholder = "Select an option",
    error,
    editable = true,
    required = false,
}: FormSelectProps) => {
    const { isDark } = useTheme();
    const [visible, setVisible] = useState(false);

    const selectedOption = options.find((opt) => opt.value === value);

    return (
        <View className="mb-4">
            <View className="flex-row mb-1.5">
                <Text className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    {label}
                </Text>
                {required && <Text className="text-red-500 ml-0.5">*</Text>}
            </View>

            <TouchableOpacity
                onPress={editable ? () => setVisible(true) : undefined}
                className={`w-full p-3 rounded-xl border flex-row justify-between items-center ${error
                    ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                    : isDark
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    }`}
            >
                <Text
                    className={`${selectedOption
                        ? isDark
                            ? "text-white"
                            : "text-gray-900"
                        : isDark
                            ? "text-gray-500"
                            : "text-gray-400"
                        }`}
                >
                    {selectedOption ? selectedOption.label : placeholder}
                </Text>
                <Ionicons
                    name="chevron-down"
                    size={20}
                    color={isDark ? "#9CA3AF" : "#6B7280"}
                />
            </TouchableOpacity>

            {error && <Text className="text-xs text-red-500 mt-1">{error}</Text>}

            <Modal transparent visible={visible} animationType="fade" onRequestClose={() => setVisible(false)}>
                <TouchableWithoutFeedback onPress={() => setVisible(false)}>
                    <View className="flex-1 bg-black/50 justify-end">
                        <TouchableWithoutFeedback>
                            <View
                                className={`rounded-t-3xl max-h-[50%] ${isDark ? "bg-gray-900" : "bg-white"
                                    }`}
                            >
                                <View className="p-4 border-b border-gray-100 dark:border-gray-800 flex-row justify-between items-center">
                                    <Text
                                        className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"
                                            }`}
                                    >
                                        Select {label}
                                    </Text>
                                    <TouchableOpacity onPress={() => setVisible(false)}>
                                        <Ionicons
                                            name="close"
                                            size={24}
                                            color={isDark ? "#FFF" : "#000"}
                                        />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView contentContainerStyle={{ padding: 16 }}>
                                    {options.map((option) => (
                                        <TouchableOpacity
                                            key={option.value}
                                            onPress={() => {
                                                onChange(option.value);
                                                setVisible(false);
                                            }}
                                            className={`p-4 mb-2 rounded-xl ${value === option.value
                                                ? isDark
                                                    ? "bg-blue-900/30"
                                                    : "bg-blue-50"
                                                : isDark
                                                    ? "bg-gray-800"
                                                    : "bg-gray-50"
                                                }`}
                                        >
                                            <Text
                                                className={`font-medium ${value === option.value
                                                    ? "text-blue-600 dark:text-blue-400"
                                                    : isDark
                                                        ? "text-gray-200"
                                                        : "text-gray-900"
                                                    }`}
                                            >
                                                {option.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                    {options.length === 0 && (
                                        <Text className={`text-center py-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}>No options available</Text>
                                    )}
                                </ScrollView>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};
