import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../store/hooks/useTheme";
import { Student } from "../../types";

interface StudentDetailsModalProps {
    visible: boolean;
    student: Student | null;
    onClose: () => void;
}

const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({ visible, student, onClose }) => {
    const { isDark } = useTheme();

    if (!student) return null;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/50">
                <View className={`${isDark ? "bg-gray-900" : "bg-white"} rounded-t-3xl p-6 h-[50%]`}>

                    {/* Header with Close Button */}
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Student Details</Text>
                        <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                            <Ionicons name="close" size={24} color={isDark ? "white" : "black"} />
                        </TouchableOpacity>
                    </View>

                    {/* Profile Content */}
                    <View className="items-center mb-6">
                        <View className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center mb-4">
                            <Text className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                                {student.name.charAt(0)}
                            </Text>
                        </View>
                        <Text className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{student.name}</Text>
                        <Text className={`text-lg ${isDark ? "text-gray-400" : "text-gray-500"}`}>{student.rollNumber}</Text>
                    </View>

                    {/* Details Grid */}
                    <View className="flex-row flex-wrap justify-between">
                        <View className={`w-[48%] p-4 rounded-xl mb-4 ${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
                            <Text className={`text-xs uppercase mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Class</Text>
                            <Text className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                                {student.class?.name || "N/A"}
                            </Text>
                        </View>

                        <View className={`w-[48%] p-4 rounded-xl mb-4 ${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
                            <Text className={`text-xs uppercase mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Email</Text>
                            <Text className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`} numberOfLines={1}>
                                {student.email || "N/A"}
                            </Text>
                        </View>

                        <View className={`w-[48%] p-4 rounded-xl mb-4 ${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
                            <Text className={`text-xs uppercase mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Semester</Text>
                            <Text className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                                {student.class?.semester || "N/A"}
                            </Text>
                        </View>

                        <View className={`w-[48%] p-4 rounded-xl mb-4 ${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
                            <Text className={`text-xs uppercase mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Course</Text>
                            <Text className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                                {student.course?.name || "N/A"}
                            </Text>
                        </View>
                    </View>

                </View>
            </View>
        </Modal>
    );
};

export default StudentDetailsModal;
