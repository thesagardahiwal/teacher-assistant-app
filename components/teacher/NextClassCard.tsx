import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { ClassScheduleWithStatus } from "../../types/schedule.type";

interface NextClassCardProps {
    nextClass: ClassScheduleWithStatus | null;
    isDark: boolean;
}

export const NextClassCard: React.FC<NextClassCardProps> = ({ nextClass, isDark }) => {
    if (!nextClass) {
        return null;
    }

    return (
        <View className={`p-5 rounded-2xl ${isDark ? "bg-blue-900" : "bg-blue-600"} shadow-lg relative overflow-hidden`}>
            <View className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-white/10" />
            <View className="absolute -left-10 -bottom-10 w-24 h-24 rounded-full bg-white/10" />

            <View className="flex-row justify-between items-start mb-4">
                <View>
                    <Text className="text-blue-100 font-medium mb-1">
                        {nextClass.status === "Previous" ? "Previous / Current Class" : "Upcoming Class"}
                    </Text>
                    <Text className="text-white text-2xl font-bold">{nextClass.subject?.name || "Subject"}</Text>
                    <Text className="text-blue-100">{nextClass.class?.name ? `Class ${nextClass.class.name}` : "Class N/A"}</Text>
                </View>
                <View className="bg-white/20 p-2 rounded-lg">
                    <Ionicons name="notifications" size={20} color="white" />
                </View>
            </View>

            <View className="flex-row items-center bg-white/20 self-start px-3 py-1 rounded-full">
                <Ionicons name="time-outline" size={16} color="white" />
                <Text className="text-white ml-2 font-medium">
                    {nextClass.startTime} - {nextClass.endTime}
                </Text>
            </View>
        </View>
    );
};
