import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export const QuickAction = ({
    icon,
    label,
    onPress,
    bgColor,
    className,
    iconLibrary = "MaterialCommunityIcons",
    isDark = false
}: {
    icon: any;
    label: string;
    onPress: () => void;
    bgColor: string;
    className?: string;
    isDark?: boolean;
    iconLibrary?: "MaterialCommunityIcons" | "Ionicons"
}) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        className={`p-4 rounded-2xl ${isDark ? "bg-gray-800" : "bg-white"} shadow-sm ${className || ''}`}
    >
        <View className={`w-12 h-12 rounded-full ${bgColor} items-center justify-center mb-3`}>
            {iconLibrary === "Ionicons" ? (
                <Ionicons name={icon} size={22} color="white" />
            ) : (
                <MaterialCommunityIcons name={icon} size={22} color="white" />
            )}
        </View>
        <Text className={`font-semibold text-sm ${isDark ? "text-gray-200" : "text-gray-700"}`}>
            {label}
        </Text>
    </TouchableOpacity>
);