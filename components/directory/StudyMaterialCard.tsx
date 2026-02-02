import { fileViewerService } from "@/services/local/fileViewer.service";
import { localFileService } from "@/services/local/localFile.service";
import { metadataService } from "@/services/local/metadata.service";
import { useTheme } from "@/store/hooks/useTheme";
import { StudyFile } from "@/types/study-file.type";
import { showAlert } from "@/utils/alert";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface StudyMaterialCardProps {
    file: StudyFile;
    index: number;
    onDelete: () => void;
    onRename: () => void;
}

export function StudyMaterialCard({ file, index, onDelete, onRename }: StudyMaterialCardProps) {
    const { isDark } = useTheme();
    const [menuVisible, setMenuVisible] = useState(false);

    const handleOpen = async () => {
        try {
            const uri = localFileService.getAbsolutePath(file.localPath);
            await fileViewerService.openFile(uri, file.fileType);
        } catch (error) {
            showAlert("Error", "Could not open file. It may have been deleted.");
        }
    };

    const handleShare = async () => {
        setMenuVisible(false);
        try {
            const uri = localFileService.getAbsolutePath(file.localPath);
            await fileViewerService.shareFile(uri);
        } catch (error) {
            showAlert("Error", "Could not share file.");
        }
    };

    const handleDelete = () => {
        setMenuVisible(false);
        showAlert(
            "Delete File",
            `Are you sure you want to delete "${file.fileName}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await localFileService.deleteFile(file.localPath);
                            await metadataService.deleteFile(file.id);
                            onDelete();
                        } catch (error) {
                            showAlert("Error", "Failed to delete file");
                        }
                    },
                },
            ]
        );
    };

    const handleRenameAction = () => {
        setMenuVisible(false);
        onRename();
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const result = bytes / k;
        return result < 1024 ? `${result.toFixed(1)} KB` : `${(result / 1024).toFixed(1)} MB`;
    };

    const getIconName = (mimeType: string) => {
        if (mimeType.includes('pdf')) return 'document-text';
        if (mimeType.includes('image')) return 'image';
        return 'document';
    };

    return (
        <>
            <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
                <TouchableOpacity
                    onPress={handleOpen}
                    activeOpacity={0.7}
                    className={`p-4 mb-3 rounded-2xl border flex-row items-center ${isDark ? "bg-dark-card border-dark-border" : "bg-white border-gray-100"} shadow-sm`}
                >
                    <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${isDark ? "bg-blue-900/20" : "bg-blue-50"}`}>
                        <Ionicons name={getIconName(file.fileType)} size={24} color="#3B82F6" />
                    </View>

                    <View className="flex-1 pr-2">
                        <Text className={`text-base font-semibold mb-1 ${isDark ? "text-gray-100" : "text-gray-900"}`} numberOfLines={1}>
                            {file.fileName}
                        </Text>

                        <View className="flex-row items-center flex-wrap gap-2">
                            <Text className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                {formatBytes(file.fileSize)} • {new Date(file.addedAt).toLocaleDateString()}
                            </Text>
                            {/* Tags */}
                            {file.tags.length > 0 && (
                                <View className={`px-2 py-0.5 rounded-full ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                                    <Text className={`text-[10px] ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                        {file.tags.length} tag{file.tags.length > 1 ? 's' : ''}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Three Dots Menu Trigger */}
                    <TouchableOpacity
                        onPress={() => setMenuVisible(true)}
                        className={`p-2 rounded-full ${isDark ? "active:bg-gray-800" : "active:bg-gray-100"}`}
                    >
                        <Ionicons name="ellipsis-vertical" size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
                    </TouchableOpacity>
                </TouchableOpacity>
            </Animated.View>

            {/* Bottom Sheet Menu */}
            <Modal
                transparent
                visible={menuVisible}
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
                    <View className="flex-1 justify-end bg-black/50">
                        <TouchableWithoutFeedback>
                            <View className={`rounded-t-3xl p-6 pb-10 ${isDark ? "bg-gray-900" : "bg-white"}`}>
                                <View className="items-center mb-6">
                                    <View className={`w-12 h-1.5 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
                                </View>

                                <View className="flex-row items-center mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                                    <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${isDark ? "bg-blue-900/20" : "bg-blue-50"}`}>
                                        <Ionicons name={getIconName(file.fileType)} size={24} color="#3B82F6" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`} numberOfLines={1}>
                                            {file.fileName}
                                        </Text>
                                        <Text className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                            {formatBytes(file.fileSize)}
                                        </Text>
                                    </View>
                                </View>

                                {/* Menu Items */}
                                <TouchableOpacity onPress={handleOpen} className="flex-row items-center py-3 mb-2">
                                    <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                                        <Ionicons name="eye-outline" size={20} color={isDark ? "#F3F4F6" : "#374151"} />
                                    </View>
                                    <Text className={`text-base font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>Open File</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={handleShare} className="flex-row items-center py-3 mb-2">
                                    <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                                        <Ionicons name="share-social-outline" size={20} color={isDark ? "#F3F4F6" : "#374151"} />
                                    </View>
                                    <Text className={`text-base font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>Share Copy</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={handleRenameAction} className="flex-row items-center py-3 mb-2">
                                    <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                                        <Ionicons name="pencil-outline" size={20} color={isDark ? "#F3F4F6" : "#374151"} />
                                    </View>
                                    <Text className={`text-base font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>Rename</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={handleDelete} className="flex-row items-center py-3">
                                    <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${isDark ? "bg-red-900/20" : "bg-red-50"}`}>
                                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                    </View>
                                    <Text className="text-base font-medium text-red-500">Delete Permanently</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => setMenuVisible(false)} className={`mt-6 py-4 rounded-xl items-center ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                                    <Text className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
}
