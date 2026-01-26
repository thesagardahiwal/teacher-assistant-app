import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../store/hooks/useTheme";

interface PhoneDisplayProps {
    phone?: string | null;
    className?: string; // Allow custom styling
}

export const PhoneDisplay = ({ phone, className }: PhoneDisplayProps) => {
    const { isDark } = useTheme();

    if (!phone) return null;

    return (
        <TouchableOpacity
            onPress={() => Linking.openURL(`tel:${phone}`)}
            className={`flex-row px-3 py-2 items-center rounded-lg border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} ${className || ""}`}
        >
            <View className={`w-6 h-6 rounded-full items-center justify-center mr-2 ${isDark ? "bg-green-900/30" : "bg-green-50"}`}>
                <Ionicons name="call" size={12} color={isDark ? "#4ade80" : "#16a34a"} />
            </View>
            <Text className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>{phone}</Text>
        </TouchableOpacity>
    );
};
