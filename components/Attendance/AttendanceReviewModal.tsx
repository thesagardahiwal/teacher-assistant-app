import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { GeminiAttendanceResult } from "../../services/ai/gemini.service";
import { useTheme } from "../../store/hooks/useTheme";

interface AttendanceReviewModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: (status: Record<string, boolean>) => void;
    aiResult: GeminiAttendanceResult | null;
}

export default function AttendanceReviewModal({
    visible,
    onClose,
    onApply,
    aiResult,
}: AttendanceReviewModalProps) {
    const { isDark } = useTheme();
    const [localStatus, setLocalStatus] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (aiResult) {
            const status: Record<string, boolean> = {};
            aiResult.detected.forEach((item) => {
                status[item.rollNumber] = item.status === "PRESENT";
            });
            setLocalStatus(status);
        }
    }, [aiResult]);

    const toggleStatus = (rollNumber: string) => {
        setLocalStatus((prev) => ({
            ...prev,
            [rollNumber]: !prev[rollNumber],
        }));
    };

    const handleApply = () => {
        onApply(localStatus);
        onClose();
    };

    if (!aiResult) return null;

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 justify-end bg-black/50">
                <View className={`h-[80%] rounded-t-3xl p-6 ${isDark ? "bg-gray-900" : "bg-white"}`}>

                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-6">
                        <View>
                            <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                                Review AI Attendance
                            </Text>
                            <Text className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                {aiResult.mode === "ATTENDANCE_CHART" ? "Chart Detected" : "List Detected"}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} className="p-2">
                            <Ionicons name="close" size={24} color={isDark ? "white" : "black"} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

                        {/* Summary Stats */}
                        <View className="flex-row gap-4 mb-6">
                            <View className={`flex-1 p-3 rounded-xl border ${isDark ? "bg-green-900/20 border-green-800" : "bg-green-50 border-green-100"}`}>
                                <Text className="text-green-600 font-bold text-lg">
                                    {Object.values(localStatus).filter(Boolean).length}
                                </Text>
                                <Text className="text-green-600 text-xs">Present</Text>
                            </View>
                            <View className={`flex-1 p-3 rounded-xl border ${isDark ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-100"}`}>
                                <Text className="text-red-600 font-bold text-lg">
                                    {Object.values(localStatus).filter((s) => !s).length}
                                </Text>
                                <Text className="text-red-600 text-xs">Absent</Text>
                            </View>
                        </View>

                        {/* Unmatched Warning */}
                        {aiResult.unmatched.length > 0 && (
                            <View className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                                <Text className="text-amber-800 dark:text-amber-400 font-bold text-xs mb-1">
                                    ⚠️ Unmatched Entries
                                </Text>
                                <Text className="text-amber-700 dark:text-amber-500 text-xs">
                                    Could not match: {aiResult.unmatched.join(", ")}
                                </Text>
                            </View>
                        )}

                        {/* List */}
                        <Text className={`font-bold mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            DETECTED STUDENTS
                        </Text>
                        {aiResult.detected.map((item) => {
                            const isPresent = localStatus[item.rollNumber] ?? false;
                            const isLowConfidence = item.confidence < 0.75;

                            return (
                                <TouchableOpacity
                                    key={item.rollNumber}
                                    onPress={() => toggleStatus(item.rollNumber)}
                                    className={`flex-row items-center p-3 mb-2 rounded-xl border ${isPresent
                                        ? isDark
                                            ? "bg-gray-800 border-green-500/30"
                                            : "bg-white border-green-200"
                                        : isDark
                                            ? "bg-gray-800 border-red-500/30"
                                            : "bg-red-50 border-red-200"
                                        }`}
                                >
                                    <View
                                        className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isPresent ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"
                                            }`}
                                    >
                                        <Text className={`font-bold ${isPresent ? "text-green-700" : "text-red-700"}`}>
                                            {item.confidence}
                                        </Text>
                                    </View>

                                    <View className="flex-1">
                                        <Text
                                            className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                                        >
                                            {item.name || `Roll #${item.rollNumber}`}
                                        </Text>
                                        {isLowConfidence && (
                                            <Text className="text-xs text-amber-500">Low Confidence Check</Text>
                                        )}
                                    </View>

                                    <Ionicons
                                        name={isPresent ? "checkmark-circle" : "close-circle"}
                                        size={24}
                                        color={isPresent ? "#16A34A" : "#DC2626"}
                                    />
                                </TouchableOpacity>
                            );
                        })}

                        <View className="h-20" />
                    </ScrollView>

                    {/* Actions */}
                    <View className="pt-4 border-t border-gray-100 dark:border-gray-800">
                        <TouchableOpacity
                            onPress={handleApply}
                            className="bg-blue-600 py-4 rounded-xl items-center"
                        >
                            <Text className="text-white font-bold text-lg">Apply Results</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
