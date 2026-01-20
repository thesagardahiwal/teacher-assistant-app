import { fileViewerService } from "@/services/local/fileViewer.service";
import { localFileService } from "@/services/local/localFile.service";
import { metadataService } from "@/services/local/metadata.service";
import { useTheme } from "@/store/hooks/useTheme";
import { StudyFile } from "@/types/study-file.type";
import { showAlert } from "@/utils/alert";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface FileListItemProps {
    file: StudyFile;
    onDelete: () => void;
    onRename: () => void;
}

export const FileListItem: React.FC<FileListItemProps> = ({ file, onDelete, onRename }) => {
    const { isDark } = useTheme();

    const handleOpen = async () => {
        try {
            const uri = localFileService.getAbsolutePath(file.localPath);
            await fileViewerService.openFile(uri, file.fileType);
        } catch (error) {
            showAlert("Error", "Could not open file. It may have been deleted.");
        }
    };

    const handleShare = async () => {
        try {
            const uri = localFileService.getAbsolutePath(file.localPath);
            await fileViewerService.shareFile(uri);
        } catch (error) {
            showAlert("Error", "Could not share file.");
        }
    };

    const handleDelete = () => {
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
                    }
                }
            ]
        );
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
        <View className={`p-4 mb-3 rounded-xl border flex-row items-center ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
            <TouchableOpacity
                onPress={handleOpen}
                className="flex-1 flex-row items-center"
            >
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isDark ? "bg-gray-700" : "bg-blue-50"}`}>
                    <Ionicons name={getIconName(file.fileType)} size={20} color="#3B82F6" />
                </View>

                <View className="flex-1 pr-2">
                    <Text className={`text-base font-bold mb-0.5 ${isDark ? "text-white" : "text-gray-900"}`} numberOfLines={1}>
                        {file.fileName}
                    </Text>

                    <View className="flex-row items-center flex-wrap gap-2">
                        <Text className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            {formatBytes(file.fileSize)} • {new Date(file.addedAt).toLocaleDateString()}
                        </Text>
                        {file.tags.map((tag, i) => (
                            <View key={i} className={`px-2 py-0.5 rounded ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                                <Text className={`text-[10px] ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                    #{tag}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </TouchableOpacity>

            <View className="flex-row items-center">
                <TouchableOpacity onPress={handleShare} className="p-2 mr-1">
                    <Ionicons name="share-social-outline" size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
                </TouchableOpacity>

                <TouchableOpacity onPress={onRename} className="p-2 mr-1">
                    <Ionicons name="pencil-outline" size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
                </TouchableOpacity>

                <TouchableOpacity onPress={handleDelete} className="p-2">
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </View>
    );
};
