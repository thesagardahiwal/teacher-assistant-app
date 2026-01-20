import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface InviteSuccessModalProps {
    visible: boolean;
    onClose: () => void;
    inviteLink: string;
    email: string;
}

export const InviteSuccessModal = ({ visible, onClose, inviteLink, email }: InviteSuccessModalProps) => {
    const handleCopy = async () => {
        await Clipboard.setStringAsync(inviteLink);
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black/50 px-4">
                <View className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-sm items-center shadow-xl">
                    <View className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center mb-4">
                        <Ionicons name="checkmark" size={24} color="#10B981" />
                    </View>

                    <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                        Invitation Created!
                    </Text>

                    <Text className="text-gray-500 dark:text-gray-400 text-center mb-6">
                        An invitation has been generated for {email}. Share this link with them to complete signup.
                    </Text>

                    <View className="w-full bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl mb-6 border border-gray-100 dark:border-gray-700">
                        <Text className="text-gray-600 dark:text-gray-300 font-mono text-center" numberOfLines={1} ellipsizeMode="middle">
                            {inviteLink}
                        </Text>
                        <TouchableOpacity
                            onPress={handleCopy}
                            className="mt-2 flex-row items-center justify-center space-x-2 py-2"
                        >
                            <Ionicons name="copy-outline" size={16} color="#3B82F6" />
                            <Text className="text-blue-500 font-medium">Copy Link</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={onClose}
                        className="w-full bg-blue-600 py-3 rounded-xl items-center"
                    >
                        <Text className="text-white font-bold text-lg">Done</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
