import { PageHeader } from "@/components/admin/ui/PageHeader";
import { AddFileModal } from "@/components/study-vault/AddFileModal";
import { RenameFileModal } from "@/components/study-vault/RenameFileModal";
import { localFileService } from "@/services/local/localFile.service";
import { metadataService } from "@/services/local/metadata.service";
import { useTheme } from "@/store/hooks/useTheme";
import { StudyFile } from "@/types/study-file.type";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { StudyMaterialCard } from "./StudyMaterialCard";

export function StudyMaterialDirectory() {
    const { isDark } = useTheme();

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
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className={`flex-1 ${isDark ? "bg-dark-background" : "bg-background"}`}
        >
            <View className="px-6 pt-6">
                <PageHeader
                    title="Study Vault"
                    rightAction={
                        <TouchableOpacity
                            onPress={() => setModalVisible(true)}
                            className="bg-blue-600 p-2 rounded-full shadow-sm"
                        >
                            <Ionicons name="add" size={24} color="white" />
                        </TouchableOpacity>
                    }
                />

                <View className={`flex-row items-center px-4 py-1 rounded-xl border mb-2 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
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

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            ) : (
                <FlatList
                    data={filteredFiles}
                    keyExtractor={item => item.id}
                    renderItem={({ item, index }) => (
                        <StudyMaterialCard
                            file={item}
                            index={index}
                            onDelete={loadFiles}
                            onRename={() => setFileToRename(item)}
                        />
                    )}
                    contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
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
        </KeyboardAvoidingView>
    );
}
