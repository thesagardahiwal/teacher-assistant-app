import { UserProfileForm } from "@/components/common/UserProfileForm";
import { StudentProfileConfig } from "@/config/user-profile.config";
import { studentService } from "@/services/student.service";
import { Link, Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../store/hooks/useAuth";
import { useTheme } from "../../store/hooks/useTheme";
import { Student } from "../../types";

const Profile = () => {
    const { user, logout } = useAuth();
    const router = useRouter();
    const { isDark } = useTheme();

    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadStudentData();
    }, [user?.$id]);

    const loadStudentData = async () => {
        try {
            if (user?.$id) {
                const data = await studentService.getByUserId(user.$id);
                if (data) {
                    setStudent(data);
                }
            }
        } catch (error) {
            console.error("Failed to load student profile", error);
            Alert.alert("Error", "Could not load profile data.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (data: any) => {
        if (!student) return;
        setSaving(true);
        try {
            // Filter data to only update allowed fields if necessary, 
            // but the service should handle it or we assume sent data is correct.
            // UserProfileForm sends all data in formData.
            // We should pick only editable fields if the API is strict.
            // For now assuming API handles it or ignores extra fields.
            await studentService.update(student.$id, data);
            Alert.alert("Success", "Profile updated successfully");
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.replace("/");
    };

    if (loading) {
        return (
            <View className={`flex-1 items-center justify-center ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className={`px-6 py-4 border-b flex-row items-center justify-between ${isDark ? "border-gray-800" : "border-gray-200"}`}>
                <Link href=".." asChild>
                    <TouchableOpacity>
                        <Text className="text-blue-500 text-lg">← Back</Text>
                    </TouchableOpacity>
                </Link>
                <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    My Profile
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView className="px-6 py-4">

                {/* Avatar Section */}
                <View className="items-center mb-6">
                    <View className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center mb-4 border-2 border-blue-500">
                        <Text className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                            {student?.name?.charAt(0) || user?.name?.charAt(0) || "S"}
                        </Text>
                    </View>
                    <Text className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {student?.name || user?.name}
                    </Text>
                    <Text className={`text-base font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        Roll No: {student?.rollNumber || "N/A"}
                    </Text>
                </View>

                {/* User Profile Form */}
                <UserProfileForm
                    initialData={student}
                    config={StudentProfileConfig.map(f => f.name === 'email' ? { ...f, editable: false } : f)}
                    onSubmit={handleSave}
                    loading={loading}
                    saving={saving}
                />

                {/* Logout Button */}
                <TouchableOpacity
                    onPress={handleLogout}
                    className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl items-center border border-red-100 dark:border-red-900/30 mb-8 mt-6"
                >
                    <Text className="text-red-600 dark:text-red-400 font-bold text-lg">
                        Log Out
                    </Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
};

export default Profile;
