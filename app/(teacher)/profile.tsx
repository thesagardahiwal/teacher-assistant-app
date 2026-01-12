import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../store/hooks/useAuth";
import { useTheme } from "../../store/hooks/useTheme";

export default function ProfileScreen() {
    const { user, logout, updateProfile } = useAuth();
    const { isDark } = useTheme();

    const [isEditing, setIsEditing] = React.useState(false);
    const [name, setName] = React.useState(user?.name || "");
    const [department, setDepartment] = React.useState(user?.department || "");
    const [designation, setDesignation] = React.useState(user?.designation || "");
    const [loading, setLoading] = React.useState(false);

    // Update state when user data changes (e.g. after save)
    React.useEffect(() => {
        if (user) {
            setName(user.name);
            setDepartment(user.department || "");
            setDesignation(user.designation || "");
        }
    }, [user]);

    const handleLogout = async () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
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
                designation
            });
            setIsEditing(false);
            Alert.alert("Success", "Profile updated successfully");
        } catch (error) {
            Alert.alert("Error", "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const SettingItem = ({ icon, label, onPress, color = isDark ? "#E5E7EB" : "#374151" }: any) => (
        <TouchableOpacity onPress={onPress} className="flex-row items-center py-4 border-b border-gray-100 dark:border-gray-800">
            <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <Text className={`flex-1 text-base font-medium ${isDark ? "text-gray-200" : "text-gray-900"}`}>{label}</Text>
            <Ionicons name="chevron-forward" size={20} color={isDark ? "#6B7280" : "#9CA3AF"} />
        </TouchableOpacity>
    );

    return (
        <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-white"}`}>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Header / Banner */}
                <View className={`h-48 ${isDark ? "bg-gray-800" : "bg-blue-600"} items-center justify-center`}>
                    <View className="w-24 h-24 bg-white rounded-full items-center justify-center border-4 border-white/20 mb-2">
                        <Text className="text-4xl font-bold text-blue-600">{user?.name?.charAt(0)}</Text>
                    </View>

                    {isEditing ? (
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            className="bg-white/20 text-white text-xl font-bold px-4 py-1 rounded text-center min-w-[200px]"
                            placeholder="Full Name"
                            placeholderTextColor="#E0E0E0"
                        />
                    ) : (
                        <Text className="text-white text-xl font-bold">{user?.name}</Text>
                    )}

                    <Text className="text-blue-100">{user?.email}</Text>
                </View>

                <View className="px-5 py-6">
                    {/* Editable Fields Section */}
                    <View className="mb-6">
                        <Text className={`text-lg font-bold mb-4 ${isDark ? "text-gray-400" : "text-gray-900"}`}>Account Details</Text>

                        <View className="mb-4">
                            <Text className={`text-sm mb-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}>Department</Text>
                            {isEditing ? (
                                <TextInput
                                    value={department}
                                    onChangeText={setDepartment}
                                    className={`p-3 rounded-lg border ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"}`}
                                    placeholder="Enter Department"
                                    placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                                />
                            ) : (
                                <Text className={`text-base font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{user?.department || "Not Set"}</Text>
                            )}
                        </View>

                        <View className="mb-4">
                            <Text className={`text-sm mb-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}>Designation</Text>
                            {isEditing ? (
                                <TextInput
                                    value={designation}
                                    onChangeText={setDesignation}
                                    className={`p-3 rounded-lg border ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"}`}
                                    placeholder="Enter Designation"
                                    placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                                />
                            ) : (
                                <Text className={`text-base font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{user?.designation || "Not Set"}</Text>
                            )}
                        </View>

                        {/* Action Buttons */}
                        {isEditing ? (
                            <View className="flex-row mt-2">
                                <TouchableOpacity
                                    onPress={() => setIsEditing(false)}
                                    className={`flex-1 p-3 rounded-lg mr-2 items-center border ${isDark ? "border-gray-700" : "border-gray-300"}`}
                                >
                                    <Text className={isDark ? "text-gray-300" : "text-gray-700"}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleSave}
                                    disabled={loading}
                                    className="flex-1 p-3 rounded-lg ml-2 items-center bg-blue-600"
                                >
                                    {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Save Changes</Text>}
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity onPress={() => setIsEditing(true)} className="flex-row items-center py-2">
                                <Text className="text-blue-600 font-bold">Edit Profile Details</Text>
                            </TouchableOpacity>
                        )}
                    </View>


                    <Text className={`text-lg font-bold mt-2 mb-4 ${isDark ? "text-gray-400" : "text-gray-900"}`}>Settings</Text>

                    <SettingItem icon="notifications-outline" label="Notifications" onPress={() => { }} />
                    <SettingItem icon="lock-closed-outline" label="Change Password" onPress={() => { }} />
                    <SettingItem icon="help-circle-outline" label="Help & Support" onPress={() => { }} />
                    <SettingItem icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => { }} />

                    <TouchableOpacity
                        onPress={handleLogout}
                        className="flex-row items-center justify-center mt-10 p-4 rounded-xl bg-red-50 border border-red-100"
                    >
                        <Ionicons name="log-out-outline" size={20} color="#DC2626" />
                        <Text className="ml-2 font-bold text-red-600">Logout</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
