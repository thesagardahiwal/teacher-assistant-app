import { UserProfileForm } from "@/components/common/UserProfileForm";
import { TeacherSelfProfileConfig } from "@/config/user-profile.config";
import { showAlert } from "@/utils/alert";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useAuth } from "../../store/hooks/useAuth";
import { useTheme } from "../../store/hooks/useTheme";

export default function ProfileScreen() {
    const { user, logout, updateProfile } = useAuth();
    const { isDark } = useTheme();

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        showAlert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                style: "destructive",
                onPress: async () => {
                    await logout();
                }
            },
        ]);
    };

    const handleSave = async (data: any) => {
        if (!user?.$id) return;
        setLoading(true);
        try {
            await updateProfile(user.$id, data);
            setIsEditing(false);
            showAlert("Success", "Profile updated successfully");
        } catch (error) {
            showAlert("Error", "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const SettingItem = ({ icon, label, onPress, color, showChevron = true, isDestructive = false }: any) => {
        const itemColor = isDestructive ? "#DC2626" : (isDark ? "#E5E7EB" : "#374151");
        const iconColor = color || (isDestructive ? "#DC2626" : (isDark ? "#E5E7EB" : "#374151"));

        return (
            <TouchableOpacity onPress={onPress} className={`flex-row items-center py-3.5 px-4 mb-2 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                <View className={`w-9 h-9 rounded-lg items-center justify-center mr-3 ${isDestructive
                    ? (isDark ? "bg-red-900/20" : "bg-red-50")
                    : (isDark ? "bg-gray-700" : "bg-gray-100")
                    }`}>
                    <Ionicons name={icon} size={18} color={iconColor} />
                </View>
                <Text className={`flex-1 text-base font-medium`} style={{ color: itemColor }}>
                    {label}
                </Text>
                {showChevron && <Ionicons name="chevron-forward" size={18} color={isDark ? "#6B7280" : "#9CA3AF"} />}
            </TouchableOpacity>
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className={`flex-1 ${isDark ? "bg-gray-950" : "bg-gray-50"}`}
        >
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="h-64 bg-blue-600 dark:bg-blue-900 relative">
                    <View className="absolute inset-0 bg-black/10" />
                    <View className="flex-row items-center justify-between px-6 pt-14">
                        <View />
                        <Text className="text-xl font-bold text-white">My Profile</Text>
                        <View />
                    </View>

                    {/* Extended background content to overlap with card */}
                    <View className={`absolute bottom-0 left-0 right-0 h-10 rounded-t-3xl ${isDark ? "bg-gray-950" : "bg-gray-50"}`} />
                </View>

                {/* Profile Card */}
                <View className="px-6 -mt-24">
                    <View className={`rounded-3xl p-6 shadow-sm mb-6 ${isDark ? "bg-gray-900 shadow-none border border-gray-800" : "bg-white shadow-gray-200"}`}>
                        <View className="items-center -mt-16 mb-4">
                            <View className="w-28 h-28 rounded-full bg-white dark:bg-gray-900 p-2 shadow-lg shadow-black/10">
                                <View className="flex-1 rounded-full bg-blue-100 dark:bg-blue-900/50 items-center justify-center border-4 border-blue-50 dark:border-blue-900">
                                    <Text className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                                        {user?.name?.charAt(0).toUpperCase() || "T"}
                                    </Text>
                                </View>
                            </View>

                            {!isEditing && (
                                <TouchableOpacity
                                    onPress={() => setIsEditing(true)}
                                    className="absolute bottom-0 right-0 bg-blue-600 w-10 h-10 rounded-full items-center justify-center shadow-lg shadow-blue-600/30 border-2 border-white dark:border-gray-900"
                                >
                                    <Ionicons name="pencil" size={18} color="white" />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View className="items-center mb-6">
                            <Text className={`text-2xl font-bold text-center ${isDark ? "text-white" : "text-gray-900"}`}>
                                {user?.name}
                            </Text>
                            <Text className={`text-center mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                {user?.email}
                            </Text>
                            <View className={`mt-3 px-4 py-1.5 rounded-full ${isDark ? "bg-blue-900/30" : "bg-blue-50"}`}>
                                <Text className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-blue-400" : "text-blue-700"}`}>
                                    Teacher Account
                                </Text>
                            </View>
                        </View>

                        {/* User Profile Form replaces Editable Fields */}
                        <View className="mt-4">
                            <UserProfileForm
                                initialData={user}
                                config={TeacherSelfProfileConfig}
                                onSubmit={handleSave}
                                loading={loading}
                                saving={loading}
                                readOnly={!isEditing}
                                showCancel={true}
                                onCancel={() => setIsEditing(false)}
                            />
                        </View>
                    </View>

                    {/* Settings Section */}
                    <View className="px-2">
                        <SettingItem
                            icon="log-out-outline"
                            label="Logout"
                            onPress={handleLogout}
                            isDestructive={true}
                            showChevron={false}
                        />
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
