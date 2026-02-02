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
import Animated, { FadeInDown, SlideInDown } from "react-native-reanimated";

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
    delay?: number;
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
    delay = 0,
}: FormSelectProps) => {
    const { isDark } = useTheme();
    const [visible, setVisible] = useState(false);

    const selectedOption = options.find((opt) => opt.value === value);

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
                onPress={editable ? () => setVisible(true) : undefined}
                className={`w-full p-4 rounded-2xl border flex-row justify-between items-center ${error
                    ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                    : isDark
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    }`}
                activeOpacity={0.7}
            >
                <Text
                    className={`text-base ${selectedOption
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
                    <View className="flex-1 bg-black/60 justify-end">
                        <TouchableWithoutFeedback>
                            <Animated.View
                                entering={SlideInDown.springify().damping(15)}
                                className={`rounded-t-3xl max-h-[60%] ${isDark ? "bg-gray-900" : "bg-white"
                                    }`}
                            >
                                <View className="p-5 border-b border-gray-100 dark:border-gray-800 flex-row justify-between items-center">
                                    <Text
                                        className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"
                                            }`}
                                    >
                                        Select {label}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => setVisible(false)}
                                        className={`p-2 rounded-full ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
                                    >
                                        <Ionicons
                                            name="close"
                                            size={20}
                                            color={isDark ? "#FFF" : "#000"}
                                        />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
                                    {options.map((option, index) => (
                                        <Animated.View
                                            key={option.value}
                                            entering={FadeInDown.delay(index * 30)}
                                        >
                                            <TouchableOpacity
                                                onPress={() => {
                                                    onChange(option.value);
                                                    setVisible(false);
                                                }}
                                                className={`p-4 mb-3 rounded-2xl flex-row items-center justify-between ${value === option.value
                                                    ? isDark
                                                        ? "bg-blue-600"
                                                        : "bg-blue-600"
                                                    : isDark
                                                        ? "bg-gray-800"
                                                        : "bg-gray-50 bg-opacity-75"
                                                    }`}
                                            >
                                                <Text
                                                    className={`font-semibold text-base ${value === option.value
                                                        ? "text-white"
                                                        : isDark
                                                            ? "text-gray-200"
                                                            : "text-gray-800"
                                                        }`}
                                                >
                                                    {option.label}
                                                </Text>
                                                {value === option.value && (
                                                    <View className="bg-white/20 p-1 rounded-full">
                                                        <Ionicons name="checkmark" size={16} color="white" />
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                        </Animated.View>
                                    ))}
                                    {options.length === 0 && (
                                        <Text className={`text-center py-8 ${isDark ? "text-gray-500" : "text-gray-400"}`}>No options available</Text>
                                    )}
                                </ScrollView>
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </Animated.View>
    );
};
