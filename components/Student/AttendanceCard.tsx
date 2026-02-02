import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "../../store/hooks/useTheme";
import { AttendanceRecord } from "../../types";

interface AttendanceCardProps {
    record: AttendanceRecord;
}

const AttendanceCard: React.FC<AttendanceCardProps> = ({ record }) => {
    const { isDark } = useTheme();
    const date = new Date(record.attendance.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        weekday: "short"
    });

    const subjectName = record.attendance.subject?.name || "Unknown Subject";
    const statusColor = record.present ? "bg-green-100 dark:bg-green-900/40" : "bg-red-100 dark:bg-red-900/40";
    const statusTextColor = record.present ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400";
    const statusLabel = record.present ? "Present" : "Absent";
    const icon = record.present ? "checkmark-circle" : "close-circle";

    return (
        <View className={`p-4 rounded-2xl mb-3 flex-row justify-between items-center ${isDark ? "bg-gray-800" : "bg-white border border-gray-100 shadow-sm"}`}>
            <View className="flex-row items-center gap-3">
                <View className={`w-10 h-10 rounded-full items-center justify-center ${statusColor}`}>
                    <Ionicons name={icon} size={20} color={record.present ? (isDark ? "#4ade80" : "#15803d") : (isDark ? "#f87171" : "#b91c1c")} />
                </View>
                <View>
                    <Text className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {subjectName}
                    </Text>
                    <Text className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"} mt-0.5`}>
                        {date}
                    </Text>
                </View>
            </View>
            <View className={`px-3 py-1.5 rounded-full ${statusColor}`}>
                <Text className={`text-xs font-semibold ${statusTextColor}`}>
                    {statusLabel}
                </Text>
            </View>
        </View>
    );
};

export default AttendanceCard;
