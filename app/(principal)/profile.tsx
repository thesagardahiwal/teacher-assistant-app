import { showAlert } from "@/utils/alert";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useAuth } from "../../store/hooks/useAuth";
import { useTheme } from "../../store/hooks/useTheme";

export default function ProfileScreen() {
    const { user, logout, updateProfile } = useAuth();
    const { isDark } = useTheme();

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || "");
    const [department, setDepartment] = useState(user?.department || "");
    const [designation, setDesignation] = useState(user?.designation || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [address, setAddress] = useState(user?.address || "");
    const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || "");
    const [loading, setLoading] = useState(false);

    // Update state when user data changes
    React.useEffect(() => {
        if (user) {
            setName(user.name);
            setDepartment(user.department || "");
            setDesignation(user.designation || "");
            setPhone(user.phone || "");
            setAddress(user.address || "");
            setBloodGroup(user.bloodGroup || "");
        }
    }, [user]);

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
                name,
                department,
                designation,
                phone,
                address,
                bloodGroup
            });
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

    const InputField = ({ label, value, onChangeText, placeholder, editable }: any) => (
        <View className="mb-4">
            <Text className={`text-sm font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {label}
            </Text>
            {editable ? (
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                    className={`px-4 py-3.5 rounded-xl border text-base ${isDark
                        ? "bg-gray-800 border-gray-700 text-white focus:border-blue-500"
                        : "bg-white border-gray-200 text-gray-900 focus:border-blue-500"
                        }`}
                />
            ) : (
                <View className={`px-4 py-3.5 rounded-xl border ${isDark ? "bg-gray-800/50 border-gray-800" : "bg-gray-50 border-gray-100"
                    }`}>
                    <Text className={`text-base font-medium ${isDark ? "text-gray-200" : "text-gray-900"}`}>
                        {value || "Not Set"}
                    </Text>
                </View>
            )}
        </View>
    );

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
                                        {user?.name?.charAt(0).toUpperCase() || "P"}
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
                                    Principal Account
                                </Text>
                            </View>
                        </View>

                        {/* Editable Fields */}
                        <View className="space-y-4">
                            {isEditing && (
                                <InputField
                                    label="Full Name"
                                    value={name}
                                    onChangeText={setName}
                                    editable={true}
                                    placeholder="Full Name"
                                />
                            )}

                            <View className="flex-row gap-4">
                                <View className="flex-1">
                                    <InputField
                                        label="Department"
                                        value={department}
                                        onChangeText={setDepartment}
                                        editable={isEditing}
                                        placeholder="Department"
                                    />
                                </View>
                                <View className="flex-1">
                                    <InputField
                                        label="Designation"
                                        value={designation}
                                        onChangeText={setDesignation}
                                        editable={isEditing}
                                        placeholder="Designation"
                                    />
                                </View>
                            </View>

                            <View className="flex-row gap-4">
                                <View className="flex-1">
                                    <InputField
                                        label="Phone"
                                        value={phone}
                                        onChangeText={setPhone}
                                        editable={isEditing}
                                        placeholder="+91..."
                                        keyboardType="phone-pad"
                                    />
                                </View>
                                <View className="w-1/3">
                                    <InputField
                                        label="Blood Group"
                                        value={bloodGroup}
                                        onChangeText={setBloodGroup}
                                        editable={isEditing}
                                        placeholder="O+"
                                    />
                                </View>
                            </View>

                            <InputField
                                label="Address"
                                value={address}
                                onChangeText={setAddress}
                                editable={isEditing}
                                placeholder="Enter your address"
                                multiline
                            />
                        </View>

                        {/* Action Buttons */}
                        {isEditing && (
                            <View className="flex-row gap-3 mt-6">
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsEditing(false);
                                        setName(user?.name || "");
                                        setDepartment(user?.department || "");
                                        setDesignation(user?.designation || "");
                                    }}
                                    className={`flex-1 py-3.5 rounded-xl items-center border ${isDark ? "border-gray-700" : "border-gray-300"
                                        }`}
                                >
                                    <Text className={`font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleSave}
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 py-3.5 rounded-xl items-center shadow-lg shadow-blue-600/20"
                                >
                                    {loading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text className="text-white font-bold">Save Changes</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
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
