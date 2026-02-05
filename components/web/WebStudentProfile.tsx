import { FormInput } from "@/components/admin/ui/FormInput";
import { ResponsiveContainer } from "@/components/ui/ResponsiveContainer";
import { studentService } from "@/services/student.service";
import { useAuth } from "@/store/hooks/useAuth";
import { useTheme } from "@/store/hooks/useTheme";
import { Student } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

const ReadOnlyField = ({ label, value, icon, className }: { label: string; value: string | undefined, icon?: keyof typeof Ionicons.glyphMap, className?: string }) => {
    const { isDark } = useTheme();
    return (
        <View className={`mb-4 ${className}`}>
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

export default function WebStudentProfile() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const { isDark } = useTheme();
    const { width } = useWindowDimensions();
    const isMobile = width < 768;

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
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                style: "destructive",
                onPress: async () => {
                    await logout();
                    router.replace("/");
                }
            }
        ]);
    };

    const hasChanges =
        student &&
        (phone !== (student.phone || "") ||
            address !== (student.address || "") ||
            bloodGroup !== (student.bloodGroup || ""));

    if (loading) {
        return (
            <View className={`flex-1 items-center justify-center ${isDark ? "bg-[#0f172a]" : "bg-slate-50"}`}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <View className={`flex-1 ${isDark ? "bg-[#0f172a]" : "bg-slate-50"}`}>
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 50 }}>
                <ResponsiveContainer className="p-8">

                    {/* Header with Logout */}
                    <View className="flex-row justify-between items-center mb-8">
                        <View>
                            <Text className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                                My Profile
                            </Text>
                            <Text className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                Manage your personal details
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={handleLogout}
                            className={`flex-row items-center px-4 py-2 rounded-lg border ${isDark ? "border-red-900/50 bg-red-900/10 hover:bg-red-900/20" : "border-red-100 bg-red-50 hover:bg-red-100"}`}
                        >
                            <Ionicons name="log-out-outline" size={20} color={isDark ? "#F87171" : "#EF4444"} />
                            <Text className={`ml-2 font-medium ${isDark ? "text-red-400" : "text-red-600"}`}>Logout</Text>
                        </TouchableOpacity>
                    </View>

                    <View className={`flex-row gap-8 ${isMobile ? "flex-wrap" : ""}`}>

                        {/* Left Column: Avatar & Basic Info */}
                        <View className={`min-w-[300px] ${isMobile ? "w-full" : "w-1/3"}`}>
                            <Animated.View entering={FadeInDown.duration(600).springify()}>
                                <View className={`p-8 rounded-2xl border items-center ${isDark ? "bg-[#1e293b] border-slate-700" : "bg-white border-slate-200 shadow-sm"}`}>
                                    <View className="relative mb-6">
                                        <View className={`w-32 h-32 rounded-full items-center justify-center border-4 ${isDark ? "bg-slate-800 border-slate-700" : "bg-blue-50 border-white shadow-lg shadow-blue-100"}`}>
                                            <Text className={`text-5xl font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                                                {student?.name?.charAt(0) || user?.name?.charAt(0) || "S"}
                                            </Text>
                                        </View>
                                        <View className={`absolute bottom-0 right-0 w-10 h-10 rounded-full items-center justify-center border-4 ${isDark ? "bg-green-500 border-slate-800" : "bg-green-500 border-white"}`}>
                                            <Ionicons name="checkmark" size={20} color="white" />
                                        </View>
                                    </View>

                                    <Text className={`text-2xl font-bold text-center mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                                        {student?.name || user?.name}
                                    </Text>

                                    <View className={`px-4 py-1.5 rounded-full mb-6 ${isDark ? "bg-blue-500/10" : "bg-blue-50"}`}>
                                        <Text className={`text-sm font-medium ${isDark ? "text-blue-400" : "text-blue-700"}`}>
                                            Student {student?.rollNumber ? `• Roll No: ${student.rollNumber}` : ""}
                                        </Text>
                                    </View>

                                    <View className="w-full space-y-4">
                                        <ReadOnlyField label="Institution" value={typeof student?.institution === 'object' ? student.institution.name : 'N/A'} icon="business-outline" />
                                        <ReadOnlyField label="Email" value={student?.email} icon="mail-outline" />
                                        <ReadOnlyField label="PRN" value={student?.PRN} icon="barcode-outline" />
                                    </View>
                                </View>
                            </Animated.View>
                        </View>

                        {/* Right Column: Academic & Personal Details */}
                        <View className={`flex-1 min-w-[300px]`}>

                            {/* Academic Info */}
                            <Animated.View entering={FadeInDown.duration(600).delay(100).springify()} className="mb-8">
                                <Text className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                                    Academic Information
                                </Text>
                                <View className={`p-6 rounded-2xl border ${isDark ? "bg-[#1e293b] border-slate-700" : "bg-white border-slate-200 shadow-sm"}`}>
                                    <View className="flex-row flex-wrap -mx-2">
                                        <View className="w-full md:w-1/2 px-2">
                                            <ReadOnlyField label="Course" value={typeof student?.course === 'object' ? student.course.name : 'N/A'} icon="school-outline" />
                                        </View>
                                        <View className="w-full md:w-1/2 px-2">
                                            <ReadOnlyField label="Class" value={typeof student?.class === 'object' ? student.class.name : 'N/A'} icon="people-outline" />
                                        </View>
                                        <View className="w-full md:w-1/2 px-2">
                                            <ReadOnlyField label="Current Year" value={student?.currentYear?.toString()} icon="calendar-outline" />
                                        </View>
                                        <View className="w-full md:w-1/2 px-2">
                                            <ReadOnlyField label="Seat Number" value={student?.seatNumber} icon="id-card-outline" />
                                        </View>
                                    </View>
                                </View>
                            </Animated.View>

                            {/* Personal Info Form */}
                            <Animated.View entering={FadeInDown.duration(600).delay(200).springify()}>
                                <View className="flex-row justify-between items-center mb-4">
                                    <Text className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                                        Personal Details
                                    </Text>
                                    {hasChanges && (
                                        <Text className="text-sm text-blue-500 font-medium">
                                            Unsaved Changes
                                        </Text>
                                    )}
                                </View>

                                <View className={`p-6 rounded-2xl border ${isDark ? "bg-[#1e293b] border-slate-700" : "bg-white border-slate-200 shadow-sm"}`}>
                                    <View className="flex-row flex-wrap -mx-2">
                                        <View className="w-full md:w-1/2 px-2 mb-4">
                                            <FormInput
                                                label="Phone Number"
                                                value={phone}
                                                onChangeText={setPhone}
                                                placeholder="Enter phone number"
                                                keyboardType="phone-pad"
                                            />
                                        </View>
                                        <View className="w-full md:w-1/2 px-2 mb-4">
                                            <FormInput
                                                label="Blood Group"
                                                value={bloodGroup}
                                                onChangeText={setBloodGroup}
                                                placeholder="e.g. O+"
                                            />
                                        </View>
                                        <View className="w-full px-2">
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

                                    {/* Action Buttons */}
                                    <View className="mt-6 flex-row justify-end">
                                        <TouchableOpacity
                                            onPress={handleSave}
                                            disabled={saving || !hasChanges}
                                            className={`px-8 py-3 rounded-xl items-center flex-row ${hasChanges
                                                ? "bg-blue-600 shadow-lg shadow-blue-500/30"
                                                : isDark ? "bg-slate-700" : "bg-slate-200"
                                                }`}
                                        >
                                            {saving && <ActivityIndicator size="small" color="white" className="mr-2" />}
                                            <Text className={`font-bold ${hasChanges ? "text-white" : "text-slate-400"}`}>
                                                {saving ? "Saving..." : "Save Changes"}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Animated.View>

                        </View>

                    </View>

                </ResponsiveContainer>
            </ScrollView>
        </View>
    );
}
