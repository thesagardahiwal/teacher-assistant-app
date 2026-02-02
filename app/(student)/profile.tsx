import { FormInput } from "@/components/admin/ui/FormInput";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { studentService } from "@/services/student.service";
import { useAuth } from "@/store/hooks/useAuth";
import { useTheme } from "@/store/hooks/useTheme";
import { Student } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const ReadOnlyField = ({ label, value, icon }: { label: string; value: string | undefined, icon?: keyof typeof Ionicons.glyphMap }) => {
    const { isDark } = useTheme();
    return (
        <View className="mb-4">
            <Text className={`text-xs uppercase font-bold mb-1.5 ml-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                {label}
            </Text>
            <View className={`flex-row items-center p-3.5 rounded-xl border ${isDark ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                {icon && (
                    <Ionicons name={icon} size={18} color={isDark ? "#9CA3AF" : "#6B7280"} style={{ marginRight: 10 }} />
                )}
                <Text className={`font-medium text-base flex-1 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
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
            <View className={`flex-1 items-center justify-center ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
        >
            <Stack.Screen options={{ headerShown: false }} />

            <View className="px-6 pt-6 pb-2">
                <PageHeader
                    title="My Profile"
                    subtitle="Manage your personal details"
                    showBack
                    rightAction={
                        <TouchableOpacity onPress={handleLogout} className="p-2 rounded-full bg-red-50 dark:bg-red-900/20">
                            <Ionicons name="log-out-outline" size={20} color={isDark ? "#F87171" : "#EF4444"} />
                        </TouchableOpacity>
                    }
                />
            </View>

            <ScrollView className="" contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

                {/* Avatar Section */}
                <Animated.View entering={FadeInDown.delay(100).springify()} className="items-center mb-8">
                    <View className="relative">
                        <View className={`w-28 h-28 rounded-full items-center justify-center mb-4 border-4 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-white shadow-lg shadow-blue-200"}`}>
                            <Text className={`text-5xl font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                                {student?.name?.charAt(0) || user?.name?.charAt(0) || "S"}
                            </Text>
                        </View>
                        <View className={`absolute bottom-4 right-0 w-8 h-8 rounded-full items-center justify-center border-2 ${isDark ? "bg-green-500 border-gray-900" : "bg-green-500 border-white"}`}>
                            <Ionicons name="checkmark" size={16} color="white" />
                        </View>
                    </View>

                    <Text className={`text-2xl font-bold text-center ${isDark ? "text-white" : "text-gray-900"}`}>
                        {student?.name || user?.name}
                    </Text>
                    <View className={`mt-1 px-3 py-1 rounded-full ${isDark ? "bg-blue-900/30" : "bg-blue-50"}`}>
                        <Text className={`text-sm font-medium ${isDark ? "text-blue-300" : "text-blue-700"}`}>
                            Student  {student?.rollNumber ? `•  Roll No: ${student.rollNumber}` : ""}
                        </Text>
                    </View>
                </Animated.View>

                {/* Academic Information (Read-Only) */}
                <Animated.View entering={FadeInDown.delay(200).springify()} className="mb-6">
                    <View className="flex-row items-center mb-4">
                        <View className={`w-1 h-6 rounded-full mr-3 ${isDark ? "bg-blue-500" : "bg-blue-600"}`} />
                        <Text className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                            Academic Information
                        </Text>
                    </View>

                    <View className={`p-5 rounded-3xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100 shadow-sm"}`}>
                        <ReadOnlyField label="Institution" value={typeof student?.institution === 'object' ? student.institution.name : 'N/A'} icon="business-outline" />

                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <ReadOnlyField label="Course" value={typeof student?.course === 'object' ? student.course.name : 'N/A'} icon="school-outline" />
                            </View>
                            <View className="flex-1">
                                <ReadOnlyField label="Class" value={typeof student?.class === 'object' ? student.class.name : 'N/A'} icon="people-outline" />
                            </View>
                        </View>

                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <ReadOnlyField label="Current Year" value={student?.currentYear?.toString()} icon="calendar-outline" />
                            </View>
                            <View className="flex-1">
                                <ReadOnlyField label="Seat Number" value={student?.seatNumber} icon="id-card-outline" />
                            </View>
                        </View>
                        <ReadOnlyField label="PRN" value={student?.PRN} icon="barcode-outline" />
                        <ReadOnlyField label="Email" value={student?.email} icon="mail-outline" />
                    </View>
                </Animated.View>

                {/* Personal Information (Editable) */}
                <Animated.View entering={FadeInDown.delay(300).springify()} className="mb-8">
                    <View className="flex-row items-center mb-4">
                        <View className={`w-1 h-6 rounded-full mr-3 ${isDark ? "bg-amber-500" : "bg-amber-600"}`} />
                        <Text className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                            Personal Details
                        </Text>
                    </View>

                    <View className={`p-5 rounded-3xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100 shadow-sm"}`}>
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
                </Animated.View>

                {/* Save Changes Button Area */}
                <Animated.View entering={FadeInUp.delay(400).springify()} className="mb-8">
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={saving || !hasChanges}
                        className={`py-4 rounded-2xl items-center shadow-lg ${hasChanges
                            ? "bg-blue-600 shadow-blue-500/30"
                            : isDark ? "bg-gray-800" : "bg-gray-200"
                            }`}
                    >
                        {saving ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className={`font-bold text-lg ${hasChanges ? "text-white" : isDark ? "text-gray-500" : "text-gray-400"}`}>
                                {hasChanges ? "Save Changes" : "No Changes"}
                            </Text>
                        )}
                    </TouchableOpacity>
                </Animated.View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Profile;
