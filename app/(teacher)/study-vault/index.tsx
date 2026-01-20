import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";

import { AddFileModal } from "@/components/study-vault/AddFileModal";
import { FileListItem } from "@/components/study-vault/FileListItem";
import { RenameFileModal } from "@/components/study-vault/RenameFileModal";
import { localFileService } from "@/services/local/localFile.service";
import { metadataService } from "@/services/local/metadata.service";
import { useTheme } from "@/store/hooks/useTheme";
import { StudyFile } from "@/types/study-file.type";

export default function TeacherStudyVault() {
    const { isDark } = useTheme();
    const router = useRouter();

    const [files, setFiles] = useState<StudyFile[]>([]);
    const [filteredFiles, setFilteredFiles] = useState<StudyFile[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [fileToRename, setFileToRename] = useState<StudyFile | null>(null);

    const loadFiles = async () => {
        setLoading(true);
        try {
            await localFileService.ensureDirectory();
            const allFiles = await metadataService.getAll();
            setFiles(allFiles);
            setFilteredFiles(allFiles);
        } catch (error) {
            console.error("Failed to load files", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadFiles();
        }, [])
    );

    // Filter Logic
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredFiles(files);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = files.filter(f =>
            f.fileName.toLowerCase().includes(query) ||
            f.tags.some(t => t.toLowerCase().includes(query))
        );
        setFilteredFiles(filtered);
    }, [searchQuery, files]);

    return (
        <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
            {/* Header */}
            <View className="px-5 py-4 flex-row justify-between items-center bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <Text className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    Study Vault
                </Text>
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    className="w-10 h-10 rounded-full bg-blue-600 items-center justify-center"
                >
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View className="px-5 py-3">
                <View className={`flex-row items-center px-4 py-3 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                    }`}>
                    <Ionicons name="search" size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search by name or tag..."
                        placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                        className={`flex-1 ml-3 text-base ${isDark ? "text-white" : "text-gray-900"}`}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery("")}>
                            <Ionicons name="close-circle" size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* File List */}
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            ) : (
                <FlatList
                    data={filteredFiles}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <FileListItem
                            file={item}
                            onDelete={loadFiles}
                            onRename={() => setFileToRename(item)}
                        />
                    )}
                    contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20 opacity-50">
                            <Ionicons name="folder-open-outline" size={64} color={isDark ? "#9CA3AF" : "#6B7280"} />
                            <Text className={`mt-4 text-center text-lg ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                {searchQuery ? "No matching files found" : "Your vault is empty.\nTap + to add files."}
                            </Text>
                        </View>
                    }
                />
            )}

            {/* Add File Modal */}
            <AddFileModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSuccess={loadFiles}
            />

            <RenameFileModal
                visible={!!fileToRename}
                file={fileToRename}
                onClose={() => setFileToRename(null)}
                onSuccess={loadFiles}
            />
        </View>
    );
}
