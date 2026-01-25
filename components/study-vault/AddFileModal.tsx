import { localFileService } from "@/services/local/localFile.service";
import { metadataService } from "@/services/local/metadata.service";
import { useAuth } from "@/store/hooks/useAuth";
import { useTheme } from "@/store/hooks/useTheme";
import { StudyFile } from "@/types/study-file.type";
import { showAlert } from "@/utils/alert";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
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

    // Use a unified type for the file asset
    const [selectedFile, setSelectedFile] = useState<{
        uri: string;
        name: string;
        size?: number;
        mimeType?: string;
    } | null>(null);

    const [fileName, setFileName] = useState("");
    const [fileExtension, setFileExtension] = useState("");
    const [tags, setTags] = useState("");
    const [loading, setLoading] = useState(false);

    const pickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "*/*", // allow all types
                copyToCacheDirectory: true
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                setSelectedFile({
                    uri: asset.uri,
                    name: asset.name,
                    size: asset.size,
                    mimeType: asset.mimeType,
                });

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
            showAlert("Error", "Failed to pick file");
        }
    };

    const handleCameraCapture = async () => {
        try {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (!permissionResult.granted) {
                showAlert("Permission Required", "Camera access is needed to capture documents.");
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ["images"],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];

                // Generate default filename: IMG_YYYYMMDD_HHMM
                const now = new Date();
                const timestamp = now.getFullYear().toString() +
                    (now.getMonth() + 1).toString().padStart(2, '0') +
                    now.getDate().toString().padStart(2, '0') + "_" +
                    now.getHours().toString().padStart(2, '0') +
                    now.getMinutes().toString().padStart(2, '0');

                const generatedName = `IMG_${timestamp}`;
                const extension = ".jpg";

                setSelectedFile({
                    uri: asset.uri,
                    name: generatedName + extension,
                    size: asset.fileSize, // expo-image-picker uses fileSize
                    mimeType: asset.mimeType || "image/jpeg",
                });

                setFileName(generatedName);
                setFileExtension(extension);
            }
        } catch (err) {
            showAlert("Error", "Failed to capture image");
            console.error(err);
        }
    };

    const handleSave = async () => {
        if (!selectedFile || !user) return;

        try {
            setLoading(true);

            // 1. Construct final filename
            const finalName = `${fileName.trim()}${fileExtension}`;

            // 2. Save physical file
            const localPath = await localFileService.saveFile(selectedFile.uri, finalName);

            // 3. Create metadata
            const newFile: StudyFile = {
                id: uuid.v4() as string,
                fileName: finalName,
                fileType: selectedFile.mimeType || 'unknown',
                localPath: localPath,
                fileSize: selectedFile.size || 0,
                addedByRole: user.role as "TEACHER" | "STUDENT" || "TEACHER",
                addedAt: new Date().toISOString(),
                tags: tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
            };

            // 4. Save metadata
            await metadataService.addFile(newFile);

            showAlert("Success", "File saved to Vault!");
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            showAlert("Error", "Failed to save file");
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

    const isImage = selectedFile?.mimeType?.startsWith('image/') ||
        fileExtension.toLowerCase() === '.jpg' ||
        fileExtension.toLowerCase() === '.png' ||
        fileExtension.toLowerCase() === '.jpeg';

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1 justify-end bg-black/50"
            >
                <View className={`rounded-t-3xl p-6 ${isDark ? "bg-gray-900" : "bg-white"}`}>
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                            Add to Study Vault
                        </Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Ionicons name="close-circle" size={28} color={isDark ? "#9CA3AF" : "#6B7280"} />
                        </TouchableOpacity>
                    </View>

                    {/* Selection Area */}
                    {!selectedFile ? (
                        <View className="flex-row gap-4 mb-6">
                            {/* File Picker Button */}
                            <TouchableOpacity
                                onPress={pickFile}
                                className={`flex-1 items-center justify-center p-6 rounded-xl border-2 border-dashed ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-300 bg-gray-50"}`}
                            >
                                <Ionicons name="document-text-outline" size={32} color={isDark ? "#60A5FA" : "#3B82F6"} />
                                <Text className={`mt-2 font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                    Select File
                                </Text>
                            </TouchableOpacity>

                            {/* Camera Button */}
                            <TouchableOpacity
                                onPress={handleCameraCapture}
                                className={`flex-1 items-center justify-center p-6 rounded-xl border-2 border-dashed ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-300 bg-gray-50"}`}
                            >
                                <Ionicons name="camera-outline" size={32} color={isDark ? "#60A5FA" : "#3B82F6"} />
                                <Text className={`mt-2 font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                    Take Photo
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        // File Preview Area
                        <View className="mb-6">
                            <View className={`rounded-xl p-4 flex-row items-center border ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                                {isImage ? (
                                    <Image
                                        source={{ uri: selectedFile.uri }}
                                        style={{ width: 60, height: 60, borderRadius: 8 }}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View className="w-16 h-16 rounded-lg bg-blue-100 items-center justify-center">
                                        <Ionicons name="document-text" size={32} color="#3B82F6" />
                                    </View>
                                )}

                                <View className="ml-4 flex-1">
                                    <Text className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`} numberOfLines={1}>
                                        {selectedFile.name}
                                    </Text>
                                    <Text className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                        {selectedFile.size ? (selectedFile.size / 1024).toFixed(1) : "0"} KB
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => setSelectedFile(null)}
                                        className="mt-2 flex-row items-center"
                                    >
                                        <Ionicons name="refresh" size={14} color="#EF4444" />
                                        <Text className="text-red-500 text-xs ml-1 font-medium">Change File</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}

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
            </KeyboardAvoidingView>
        </Modal >
    );
};
