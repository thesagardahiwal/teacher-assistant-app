import { useTheme } from '@/store/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface ConfirmationModalProps {
    visible: boolean;
    title: string;
    message?: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: 'default' | 'destructive';
}

export const ConfirmationModal = ({
    visible,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = 'default'
}: ConfirmationModalProps) => {
    const { isDark } = useTheme();

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View className="flex-1 justify-center items-center bg-black/50 p-4">
                <View className={`w-full max-w-sm rounded-2xl p-6 shadow-xl ${isDark ? "bg-[#1e293b]" : "bg-white"}`}>

                    {/* Icon based on type */}
                    <View className={`w-12 h-12 rounded-full items-center justify-center mb-4 ${type === 'destructive'
                            ? (isDark ? 'bg-red-900/20' : 'bg-red-50')
                            : (isDark ? 'bg-blue-900/20' : 'bg-blue-50')
                        }`}>
                        <Ionicons
                            name={type === 'destructive' ? "alert-circle" : "information-circle"}
                            size={24}
                            color={type === 'destructive' ? "#ef4444" : "#3b82f6"}
                        />
                    </View>

                    <Text className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                        {title}
                    </Text>

                    {message && (
                        <Text className={`text-base mb-6 leading-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            {message}
                        </Text>
                    )}

                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={onCancel}
                            className={`flex-1 py-3 rounded-xl border items-center justify-center ${isDark
                                    ? "border-slate-700 hover:bg-slate-800"
                                    : "border-slate-200 hover:bg-slate-50"
                                }`}
                        >
                            <Text className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                {cancelText}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onConfirm}
                            className={`flex-1 py-3 rounded-xl items-center justify-center ${type === 'destructive'
                                    ? "bg-red-500 hover:bg-red-600"
                                    : "bg-blue-600 hover:bg-blue-700"
                                }`}
                        >
                            <Text className="text-white font-bold">
                                {confirmText}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
