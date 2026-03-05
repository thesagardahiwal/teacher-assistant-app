import { LeaveStatus } from "@/types/leave.type";
import { Text, View } from "react-native";

const STATUS_STYLES: Record<LeaveStatus, { bg: string; text: string; label: string }> = {
    PENDING: {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-yellow-700 dark:text-yellow-300",
        label: "Pending",
    },
    APPROVED: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-700 dark:text-green-300",
        label: "Approved",
    },
    REJECTED: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-700 dark:text-red-300",
        label: "Rejected",
    },
    CANCELLED: {
        bg: "bg-gray-100 dark:bg-gray-800",
        text: "text-gray-700 dark:text-gray-300",
        label: "Cancelled",
    },
};

export const StatusBadge = ({ status }: { status: LeaveStatus }) => {
    const style = STATUS_STYLES[status];

    return (
        <View className={`px-2.5 py-1 rounded-full ${style.bg}`}>
            <Text className={`text-xs font-semibold ${style.text}`}>
                {style.label}
            </Text>
        </View>
    );
};
