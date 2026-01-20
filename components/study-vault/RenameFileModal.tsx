import { localFileService } from "@/services/local/localFile.service";
import { metadataService } from "@/services/local/metadata.service";
import { useTheme } from "@/store/hooks/useTheme";
import { StudyFile } from "@/types/study-file.type";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

interface RenameFileModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: (newFileName: string) => void;
    file: StudyFile | null;
}

export const RenameFileModal: React.FC<RenameFileModalProps> = ({
    visible,
    onClose,
    onSuccess,
    file
}) => {
    const { isDark } = useTheme();
    const [name, setName] = useState("");
    const [extension, setExtension] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (file) {
            const lastDot = file.fileName.lastIndexOf('.');
            if (lastDot !== -1) {
                setName(file.fileName.substring(0, lastDot));
                setExtension(file.fileName.substring(lastDot));
            } else {
                setName(file.fileName);
                setExtension("");
            }
        }
    }, [file]);

    const handleRename = async () => {
        if (!file || !name.trim()) {
            Alert.alert("Validation", "File name cannot be empty.");
            return;
        }

        // Basic validation for invalid chars
        if (/[<>:"/\\|?*]/.test(name)) {
            Alert.alert("Validation", "File name contains invalid characters.");
            return;
        }

        const newFullName = `${name.trim()}${extension}`;

        if (newFullName === file.fileName) {
            onClose(); // No change
            return;
        }

        try {
            setLoading(true);
            const newLocalPath = await localFileService.renameFile(file.localPath, newFullName);
            // newLocalPath might contain a suffix (e.g. file(1).pdf) if collision occurred.
            // We should extract the actual final name from the path to keep metadata consistent.
            const finalFileName = newLocalPath.split('/').pop() || newFullName;

            await metadataService.updateFileName(file.id, finalFileName, newLocalPath);

            Alert.alert("Success", "File renamed.");
            onSuccess(finalFileName);
            onClose();
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to rename file.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black/50 px-4">
                <View className={`w-full max-w-sm p-6 rounded-2xl ${isDark ? "bg-gray-800" : "bg-white"}`}>
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                            Rename File
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={isDark ? "#9CA3AF" : "#6B7280"} />
                        </TouchableOpacity>
                    </View>

                    <Text className={`text-sm mb-2 font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        File Name
                    </Text>

                    <View className="flex-row items-center mb-6">
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            className={`flex-1 p-3 rounded-l-xl border-y border-l ${isDark
                                    ? "bg-gray-700 border-gray-600 text-white"
                                    : "bg-gray-50 border-gray-200 text-gray-900"
                                }`}
                            placeholder="Enter file name"
                            placeholderTextColor={isDark ? "#9CA3AF" : "#9CA3AF"}
                            autoFocus
                        />
                        <View className={`p-3 rounded-r-xl border-y border-r border-l-0 ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-200"
                            }`}>
                            <Text className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                {extension}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={onClose}
                            className={`flex-1 p-4 rounded-xl border ${isDark ? "border-gray-600 bg-transparent" : "border-gray-200 bg-gray-50"
                                }`}
                        >
                            <Text className={`text-center font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                Cancel
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleRename}
                            disabled={loading}
                            className="flex-1 bg-blue-600 p-4 rounded-xl shadow-sm"
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white text-center font-bold">
                                    Save
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
