import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

export interface StatItem {
    label: string;
    value: string | number;
    icon: string; // MaterialCommunityIcons name
    colorClass?: string; // e.g. "text-blue-500"
    bgClass?: string; // e.g. "bg-blue-500" - logic handles opacity 
}

interface StatsGridProps {
    stats: StatItem[];
    isDark: boolean;
}

export function StatsGrid({ stats, isDark }: StatsGridProps) {
    return (
        <View className="flex-row flex-wrap px-4 gap-4 mb-6 justify-between">
            {stats.map((stat, index) => (
                <Animated.View
                    key={`${stat.label}-${index}`}
                    entering={FadeInUp.delay(200 + index * 100).springify()}
                    className="w-[47%]"
                >
                    <View className="bg-white dark:bg-dark-card p-4 rounded-2xl shadow-sm border border-border/50 dark:border-dark-border">
                        <View className="flex-row items-center justify-between mb-3">
                            {/* Icon Container with subtle background based on stat color/type if possible, else generic primary */}
                            <View className={`w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center`}>
                                <MaterialCommunityIcons
                                    name={stat.icon as any}
                                    size={22}
                                    color={isDark ? "#9CA3AF" : "#475569"}
                                />
                            </View>
                            {/* Could add trend indicator here later */}
                        </View>

                        <Text className="text-2xl font-bold text-textPrimary dark:text-dark-textPrimary">
                            {stat.value}
                        </Text>
                        <Text className="text-xs text-textSecondary dark:text-dark-textSecondary font-medium mt-1">
                            {stat.label}
                        </Text>
                    </View>
                </Animated.View>
            ))}
        </View>
    );
}
