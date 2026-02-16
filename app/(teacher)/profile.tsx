import { FormInput } from "@/components/admin/ui/FormInput";
import { AppUpdater } from "@/components/common/AppUpdater";
import { useAuth } from "@/store/hooks/useAuth";
import { useTheme } from "@/store/hooks/useTheme";
import { showAlert } from "@/utils/alert";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const ReadOnlyField = ({ label, value }: { label: string; value: string | undefined }) => {
    const { isDark } = useTheme();
    return (
        <View className="mb-4">
            <Text className={`text-xs uppercase font-bold mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                {label}
            </Text>
            <View className={`p-3.5 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                <Text className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    {value || "Not Set"}
                </Text>
            </View>
        </View>
    );
};

export default function ProfileScreen() {
    const { user, logout, updateProfile } = useAuth();
    const { isDark } = useTheme();

    const [loading, setLoading] = useState(false);

    // Editable State
    const [phone, setPhone] = useState(user?.phone || "");
    const [address, setAddress] = useState(user?.address || "");
    const [department, setDepartment] = useState(user?.department || "");
    const [designation, setDesignation] = useState(user?.designation || "");
    const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || "");

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

    const handleSave = async () => {
        if (!user?.$id) return;
        setLoading(true);
        try {
            await updateProfile(user.$id, {
                phone,
                address,
                department,
                designation,
                bloodGroup,
            });
            showAlert("Success", "Profile updated successfully");
        } catch (error) {
            showAlert("Error", "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const hasChanges =
        phone !== (user?.phone || "") ||
        address !== (user?.address || "") ||
        department !== (user?.department || "") ||
        designation !== (user?.designation || "") ||
        bloodGroup !== (user?.bloodGroup || "");

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className={`flex-1 ${isDark ? "bg-gray-950" : "bg-gray-50"}`}
        >
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="h-64 bg-blue-600 dark:bg-blue-900 relative">
                    <View className="absolute inset-0 bg-black/10" />
                    <View className="flex-row items-center justify-between px-6 pt-14">
                        <View />
                        <Text className="text-xl font-bold text-white">My Profile</Text>
                        <View />
                    </View>
                    <View className={`absolute bottom-0 left-0 right-0 h-10 rounded-t-3xl ${isDark ? "bg-gray-950" : "bg-gray-50"}`} />
                </View>

                <View className="px-6 -mt-24">
                    {/* Profile Card */}
                    <View className={`rounded-3xl p-6 shadow-sm mb-6 ${isDark ? "bg-gray-900 shadow-none border border-gray-800" : "bg-white shadow-gray-200"}`}>
                        <View className="items-center -mt-16 mb-4">
                            <View className="w-28 h-28 rounded-full bg-white dark:bg-gray-900 p-2 shadow-lg shadow-black/10">
                                <View className="flex-1 rounded-full bg-blue-100 dark:bg-blue-900/50 items-center justify-center border-4 border-blue-50 dark:border-blue-900">
                                    <Text className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                                        {user?.name?.charAt(0).toUpperCase() || "T"}
                                    </Text>
                                </View>
                            </View>
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

                        {/* Read-Only Info */}
                        <View className="mb-6">
                            <Text className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-800"}`}>
                                Account Info
                            </Text>
                            <ReadOnlyField label="Institution" value={typeof user?.institution === 'object' ? user.institution.name : 'Current Institution'} />
                            <ReadOnlyField label="Role" value={user?.role} />
                        </View>

                        {/* Editable Professional Info */}
                        <View className="mb-6">
                            <Text className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-800"}`}>
                                Professional Details
                            </Text>
                            <FormInput
                                label="Department"
                                value={department}
                                onChangeText={setDepartment}
                                placeholder="Department Name"
                            />
                            <FormInput
                                label="Designation"
                                value={designation}
                                onChangeText={setDesignation}
                                placeholder="Job Title"
                            />
                        </View>

                        {/* Editable Contact Info */}
                        <View className="mb-6">
                            <Text className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-800"}`}>
                                Contact Information
                            </Text>
                            <FormInput
                                label="Phone Number"
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="Phone Number"
                                keyboardType="phone-pad"
                            />
                            <FormInput
                                label="Blood Group"
                                value={bloodGroup}
                                onChangeText={setBloodGroup}
                                placeholder="Blood Group"
                            />
                            <FormInput
                                label="Address"
                                value={address}
                                onChangeText={setAddress}
                                placeholder="Full Address"
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        {/* Save Button */}
                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={loading || !hasChanges}
                            className={`py-4 rounded-xl items-center mb-4 ${hasChanges ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-800"
                                }`}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className={`font-bold text-lg ${hasChanges ? "text-white" : "text-gray-500"}`}>
                                    Save Changes
                                </Text>
                            )}
                        </TouchableOpacity>

                        {/* Logout Button */}
                        <TouchableOpacity
                            onPress={handleLogout}
                            className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl items-center border border-red-100 dark:border-red-900/30"
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="log-out-outline" size={20} color={isDark ? "#f87171" : "#dc2626"} />
                                <Text className="ml-2 text-red-600 dark:text-red-400 font-bold text-lg">
                                    Logout
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <View className="mt-6">
                            <AppUpdater />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
