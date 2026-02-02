import { FormInput } from "@/components/admin/ui/FormInput";
import { studentService } from "@/services/student.service";
import { useAuth } from "@/store/hooks/useAuth";
import { useTheme } from "@/store/hooks/useTheme";
import { Student } from "@/types";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";

const ReadOnlyField = ({ label, value }: { label: string; value: string | undefined }) => {
    const { isDark } = useTheme();
    return (
        <View className="mb-4">
            <Text className={`text-xs uppercase font-bold mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                {label}
            </Text>
            <View className={`p-3.5 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                <Text className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    {value || "N/A"}
                </Text>
            </View>
        </View>
    );
};

const Profile = () => {
    const { user, logout } = useAuth();
    const router = useRouter();
    const { isDark } = useTheme();

    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Editable State
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [bloodGroup, setBloodGroup] = useState("");

    useEffect(() => {
        loadStudentData();
    }, [user?.$id]);

    const loadStudentData = async () => {
        try {
            if (user?.$id) {
                const data = await studentService.getByUserId(user.$id);
                if (data) {
                    setStudent(data);
                    // Init form state
                    setPhone(data.phone || "");
                    setAddress(data.address || "");
                    setBloodGroup(data.bloodGroup || "");
                }
            }
        } catch (error) {
            console.error("Failed to load student profile", error);
            Alert.alert("Error", "Could not load profile data.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!student) return;
        setSaving(true);
        try {
            await studentService.update(student.$id, {
                phone,
                address,
                bloodGroup,
            });
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

    const hasChanges =
        student &&
        (phone !== (student.phone || "") ||
            address !== (student.address || "") ||
            bloodGroup !== (student.bloodGroup || ""));

    if (loading) {
        return (
            <View className={`flex-1 items-center justify-center ${isDark ? "bg-dark-background" : "bg-background"}`}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className={`flex-1 ${isDark ? "bg-dark-background" : "bg-background"}`}
        >
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}


            <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>

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
                        {student?.rollNumber ? `Roll No: ${student.rollNumber}` : "Student"}
                    </Text>
                </View>

                {/* Academic Information (Read-Only) */}
                <View className="mb-6">
                    <Text className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-800"}`}>
                        Academic Information
                    </Text>
                    <View className={`p-4 rounded-2xl ${isDark ? "bg-gray-800" : "bg-white"}`}>
                        <ReadOnlyField label="Institution" value={typeof student?.institution === 'object' ? student.institution.name : 'N/A'} />
                        <ReadOnlyField label="Course" value={typeof student?.course === 'object' ? student.course.name : 'N/A'} />
                        <ReadOnlyField label="Class" value={typeof student?.class === 'object' ? student.class.name : 'N/A'} />
                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <ReadOnlyField label="Current Year" value={student?.currentYear?.toString()} />
                            </View>
                            <View className="flex-1">
                                <ReadOnlyField label="Seat Number" value={student?.seatNumber} />
                            </View>
                        </View>
                        <ReadOnlyField label="PRN" value={student?.PRN} />
                        <ReadOnlyField label="Email" value={student?.email} />
                    </View>
                </View>

                {/* Personal Information (Editable) */}
                <View className="mb-6">
                    <Text className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-800"}`}>
                        Personal Details (Editable)
                    </Text>
                    <View className={`p-4 rounded-2xl ${isDark ? "bg-gray-800" : "bg-white"}`}>
                        <FormInput
                            label="Phone Number"
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Enter phone number"
                            keyboardType="phone-pad"
                        />
                        <FormInput
                            label="Blood Group"
                            value={bloodGroup}
                            onChangeText={setBloodGroup}
                            placeholder="e.g. O+"
                        />
                        <FormInput
                            label="Address"
                            value={address}
                            onChangeText={setAddress}
                            multiline
                            numberOfLines={3}
                            placeholder="Enter full address"
                        />
                    </View>
                </View>

                {/* Save Changes Button */}
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving || !hasChanges}
                    className={`py-4 rounded-xl items-center mb-4 ${hasChanges ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-800"
                        }`}
                >
                    {saving ? (
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
                    className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl items-center border border-red-100 dark:border-red-900/30 mb-8"
                >
                    <Text className="text-red-600 dark:text-red-400 font-bold text-lg">
                        Log Out
                    </Text>
                </TouchableOpacity>

            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Profile;
