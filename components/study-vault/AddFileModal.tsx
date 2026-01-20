import { localFileService } from "@/services/local/localFile.service";
import { metadataService } from "@/services/local/metadata.service";
import { useAuth } from "@/store/hooks/useAuth";
import { useTheme } from "@/store/hooks/useTheme";
import { StudyFile } from "@/types/study-file.type";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import uuid from 'react-native-uuid';

interface AddFileModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddFileModal: React.FC<AddFileModalProps> = ({ visible, onClose, onSuccess }) => {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const insets = useSafeAreaInsets();

    const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [fileName, setFileName] = useState("");
    const [fileExtension, setFileExtension] = useState("");
    const [tags, setTags] = useState("");
    const [loading, setLoading] = useState(false);

    const pickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "*/*", // allow all types for now
                copyToCacheDirectory: true
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                setSelectedFile(asset);

                // Extract name and extension
                const lastDot = asset.name.lastIndexOf('.');
                if (lastDot !== -1) {
                    setFileName(asset.name.substring(0, lastDot));
                    setFileExtension(asset.name.substring(lastDot));
                } else {
                    setFileName(asset.name);
                    setFileExtension("");
                }
            }
        } catch (err) {
            Alert.alert("Error", "Failed to pick file");
        }
    };

    const handleSave = async () => {
        if (!selectedFile || !user) return;

        try {
            setLoading(true);

            // 1. Construct final filename
            const finalName = `${fileName.trim()}${fileExtension}`;

            // 2. Save physical file (rename if collision handles in service, or unique by timestamp logic)
            // Note: service.saveFile uses timestamp prefix currently. We should stick to that for "Add", 
            // OR use the new rename logic if we want "exact" names. 
            // User requirement: "Update physical file name". 
            // If we use saveFile as is, it returns `timestamp_name.pdf`. This is safe.
            // If user explicitly wants "Math.pdf" we might need to change saveFile logic.
            // But let's stick to the existing robust saveFile for NEW files to avoid collisions easily.
            // Wait, req says "Rename during upload... Update physical file name".
            // The existing saveFile logic `Date.now() + fileName` ALREADY uses the passed fileName.
            // So if I pass `finalName` instead of `selectedFile.name`, it works perfectly.

            const localPath = await localFileService.saveFile(selectedFile.uri, finalName);

            // 2. Create metadata
            const newFile: StudyFile = {
                id: uuid.v4() as string,
                fileName: finalName,
                fileType: selectedFile.mimeType || 'unknown',
                localPath: localPath,
                fileSize: selectedFile.size || 0,
                addedByRole: user.role as "TEACHER" | "STUDENT" || "TEACHER",
                addedAt: new Date().toISOString(),
                tags: tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
                // Could be extended to capture Subject / Class selection
            };

            // 3. Save metadata
            await metadataService.addFile(newFile);

            Alert.alert("Success", "File saved to Vault!");
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to save file");
        } finally {
            setLoading(false);
            setSelectedFile(null);
            setTags("");
        }
    };

    const handleClose = () => {
        if (!loading) {
            setSelectedFile(null);
            setFileName("");
            setFileExtension("");
            setTags("");
            onClose();
        }
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={handleClose}
        >
            <View className="flex-1 justify-end bg-black/50">
                <View className={`rounded-t-3xl p-6 ${isDark ? "bg-gray-900" : "bg-white"}`}>
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                            Add to Study Vault
                        </Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Ionicons name="close-circle" size={28} color={isDark ? "#9CA3AF" : "#6B7280"} />
                        </TouchableOpacity>
                    </View>

                    {/* File Picker */}
                    <TouchableOpacity
                        onPress={pickFile}
                        className={`border-2 border-dashed rounded-xl p-8 items-center mb-4 ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-300 bg-gray-50"
                            }`}
                    >
                        {selectedFile ? (
                            <View className="items-center">
                                <Ionicons name="document-text" size={40} color="#3B82F6" />
                                <Text className={`mt-2 font-medium text-center ${isDark ? "text-white" : "text-gray-900"}`}>
                                    {selectedFile.name}
                                </Text>
                                <Text className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                    {(selectedFile.size! / 1024).toFixed(1)} KB
                                </Text>
                            </View>
                        ) : (
                            <View className="items-center">
                                <Ionicons name="cloud-upload-outline" size={40} color={isDark ? "#9CA3AF" : "#6B7280"} />
                                <Text className={`mt-2 font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                    Tap to select a file
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* File Name Editor */}
                    {selectedFile && (
                        <View className="mb-4">
                            <Text className={`text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                File Name
                            </Text>
                            <View className="flex-row items-center">
                                <TextInput
                                    value={fileName}
                                    onChangeText={setFileName}
                                    className={`flex-1 p-3 rounded-l-xl border-y border-l ${isDark
                                        ? "bg-gray-700 border-gray-600 text-white"
                                        : "bg-gray-50 border-gray-200 text-gray-900"
                                        }`}
                                />
                                <View className={`p-3 rounded-r-xl border-y border-r border-l-0 ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-200"
                                    }`}>
                                    <Text className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                        {fileExtension}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Tags Input */}
                    <View className="mb-6">
                        <Text className={`text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            Tags (comma separated)
                        </Text>
                        <TextInput
                            value={tags}
                            onChangeText={setTags}
                            placeholder="e.g. math, homework, important"
                            placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                            className={`p-4 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"
                                }`}
                        />
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={!selectedFile || loading}
                        className={`p-4 rounded-xl flex-row justify-center items-center ${!selectedFile || loading
                            ? (isDark ? "bg-gray-800" : "bg-gray-200")
                            : "bg-blue-600"
                            }`}
                        style={{ marginBottom: insets.bottom }}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Ionicons name="save-outline" size={20} color={!selectedFile ? "#9CA3AF" : "white"} />
                                <Text className={`ml-2 font-bold ${!selectedFile ? "text-gray-500" : "text-white"}`}>
                                    Save to Vault
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                </View>
            </View>
        </Modal >
    );
};
