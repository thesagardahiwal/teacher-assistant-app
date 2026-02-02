import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

interface QuickActionCardProps {
    label: string;
    icon: string;
    iconLibrary?: "Ionicons" | "MaterialCommunityIcons";
    onPress: () => void;
    isDark: boolean;
    color?: string; // Optional custom color class like 'bg-blue-500' if needed, but we'll stick to a design system
    index?: number;
    className?: string;
}

export function QuickActionCard({
    label,
    icon,
    iconLibrary = "MaterialCommunityIcons",
    onPress,
    isDark,
    index = 0,
    className
}: QuickActionCardProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    return (
        <Animated.View
            entering={FadeInUp.delay(300 + index * 50).springify()}
            className={className}
        >
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.9}
                className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-border/50 dark:border-dark-border shadow-sm items-center justify-center h-28 gap-3"
            >
                <Animated.View style={animatedStyle} className="items-center gap-3">
                    <View className={`w-12 h-12 rounded-full ${isDark ? "bg-dark-primary/20" : "bg-primary/10"} items-center justify-center`}>
                        {iconLibrary === "Ionicons" ? (
                            <Ionicons name={icon as any} size={24} color={isDark ? "#60A5FA" : "#2563EB"} />
                        ) : (
                            <MaterialCommunityIcons name={icon as any} size={24} color={isDark ? "#60A5FA" : "#2563EB"} />
                        )}
                    </View>
                    <Text className="text-xs font-semibold text-center text-textPrimary dark:text-dark-textPrimary numberOfLines={2}">
                        {label}
                    </Text>
                </Animated.View>
            </TouchableOpacity>
        </Animated.View>
    );
}
