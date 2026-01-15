import React from "react";
import { Text, View } from "react-native";
import { AttendanceRecord } from "../../types";

interface AttendanceCardProps {
    record: AttendanceRecord;
}

const AttendanceCard: React.FC<AttendanceCardProps> = ({ record }) => {
    const date = new Date(record.attendance.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    const subjectName = record.attendance.subject?.name || "Unknown Subject";
    const statusColor = record.present ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900";
    const statusTextColor = record.present ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300";
    const statusLabel = record.present ? "Present" : "Absent";

    return (
        <View className="bg-card dark:bg-dark-card p-4 rounded-xl border border-border dark:border-dark-border mb-3 flex-row justify-between items-center shadow-sm">
            <View>
                <Text className="text-lg font-semibold text-textPrimary dark:text-dark-textPrimary">
                    {subjectName}
                </Text>
                <Text className="text-sm text-textSecondary dark:text-dark-textSecondary mt-1">
                    {date}
                </Text>
            </View>
            <View className={`px-3 py-1 rounded-full ${statusColor}`}>
                <Text className={`text-sm font-medium ${statusTextColor}`}>
                    {statusLabel}
                </Text>
            </View>
        </View>
    );
};

export default AttendanceCard;
