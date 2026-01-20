import { FormInput } from "@/components/admin/ui/FormInput";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { userService } from "@/services/user.service";
import { useAuth } from "@/store/hooks/useAuth";
import { useTheme } from "@/store/hooks/useTheme";
import { showAlert } from "@/utils/alert";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function PrincipalProfile() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { isDark } = useTheme();

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || "");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name);
        }
    }, [user]);

    const handleSave = async () => {
        if (!name) {
            showAlert("Error", "Name is required");
            return;
        }

        setLoading(true);
        try {
            await userService.update(user!.$id, { name });
            // Refresh user data if needed, or rely on auth store update
            showAlert("Success", "Profile updated successfully");
            setIsEditing(false);
        } catch (error: any) {
            showAlert("Error", error.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        showAlert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                style: "destructive",
                onPress: async () => {
                    await logout();
                    router.replace("/(auth)/login");
                },
            },
        ]);
    };

    return (
        <View className={`flex-1 px-6 pt-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
            <PageHeader title="Principal Profile" />

            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="items-center mb-8">
                    <View className="w-24 h-24 rounded-full bg-blue-600 dark:bg-blue-500 items-center justify-center mb-4">
                        <Text className="text-white text-4xl font-bold">{user?.name?.charAt(0)}</Text>
                    </View>
                    <Text className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {user?.name}
                    </Text>
                    <Text className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {user?.email}
                    </Text>
                    <View className="mt-2 bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                        <Text className="text-blue-700 dark:text-blue-300 text-xs font-bold uppercase">
                            {user?.role}
                        </Text>
                    </View>
                </View>

                <View className={`p-6 rounded-2xl mb-6 ${isDark ? "bg-gray-800" : "bg-white"}`}>
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                            Personal Details
                        </Text>
                        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                            <Text className="text-blue-600 font-bold">{isEditing ? "Cancel" : "Edit"}</Text>
                        </TouchableOpacity>
                    </View>

                    <FormInput
                        label="Full Name"
                        value={name}
                        onChangeText={setName}
                        editable={isEditing}
                    />

                    <View className="opacity-50">
                        <FormInput
                            label="Email Address"
                            value={user?.email || ""}
                            editable={false}
                        />
                    </View>

                    <View className="opacity-50">
                        <FormInput
                            label="Role"
                            value={user?.role || ""}
                            editable={false}
                        />
                    </View>
                </View>

                {isEditing && (
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={loading}
                        className={`py-4 rounded-xl items-center mb-6 ${loading ? "bg-blue-400" : "bg-blue-600"}`}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Save Changes</Text>
                        )}
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    onPress={handleLogout}
                    className="flex-row items-center justify-center p-4 rounded-xl bg-red-50 dark:bg-red-900/20 mb-10 border border-red-100 dark:border-red-900/50"
                >
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                    <Text className="ml-2 text-red-500 font-bold">Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
