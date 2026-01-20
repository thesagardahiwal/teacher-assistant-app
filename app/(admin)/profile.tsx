import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../store/hooks/useAuth";
import { useTheme } from "../../store/hooks/useTheme";

const AdminProfile = () => {
  const router = useRouter();
  const { user, isLoading, logout, updateProfile } = useAuth();
  const { isDark } = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setDepartment(user.department || "");
      setDesignation(user.designation || "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    try {
      setSubmitting(true);
      await updateProfile(user.$id, {
        name,
        department,
        designation,
      });
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  if (isLoading || !user) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900">
        <ActivityIndicator size="large" color={isDark ? "#ffffff" : "#2563EB"} />
      </View>
    );
  }

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
      className="flex-1 bg-gray-50 dark:bg-gray-900"
    >
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="h-64 bg-blue-600 dark:bg-blue-900 relative">
          <View className="absolute inset-0 bg-black/10" />
          <View className="flex-row items-center justify-between px-6 pt-14">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-white/20 rounded-full items-center justify-center backdrop-blur-sm"
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-white">Profile</Text>
            <TouchableOpacity
              onPress={handleLogout}
              className="w-10 h-10 bg-red-500/20 rounded-full items-center justify-center backdrop-blur-sm border border-red-500/30"
            >
              <Ionicons name="log-out-outline" size={20} color="#FECACA" />
            </TouchableOpacity>
          </View>

          {/* Extended background content to overlap with card */}
          <View className="absolute bottom-0 left-0 right-0 h-10 bg-gray-50 dark:bg-gray-900 rounded-t-3xl" />
        </View>

        {/* Profile Card */}
        <View className="px-6 -mt-24">
          <View className={`rounded-3xl p-6 shadow-sm ${isDark ? "bg-gray-800 shadow-none border border-gray-700" : "bg-white shadow-gray-200"}`}>
            <View className="items-center -mt-16 mb-4">
              <View className="w-28 h-28 rounded-full bg-white dark:bg-gray-800 p-2 shadow-lg shadow-black/10">
                <View className="flex-1 rounded-full bg-blue-100 dark:bg-blue-900/50 items-center justify-center border-4 border-blue-50 dark:border-blue-900">
                  <Text className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {user.name?.charAt(0).toUpperCase() || "A"}
                  </Text>
                </View>
              </View>

              {!isEditing && (
                <TouchableOpacity
                  onPress={() => setIsEditing(true)}
                  className="absolute bottom-0 right-0 bg-blue-600 w-10 h-10 rounded-full items-center justify-center shadow-lg shadow-blue-600/30 border-2 border-white dark:border-gray-800"
                >
                  <Ionicons name="pencil" size={18} color="white" />
                </TouchableOpacity>
              )}
            </View>

            <View className="items-center mb-6">
              <Text className={`text-2xl font-bold text-center ${isDark ? "text-white" : "text-gray-900"}`}>
                {user.name}
              </Text>
              <Text className={`text-center mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                {user.email}
              </Text>
              <View className={`mt-3 px-4 py-1.5 rounded-full ${isDark ? "bg-blue-900/30" : "bg-blue-50"}`}>
                <Text className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-blue-400" : "text-blue-700"}`}>
                  {user.role}
                </Text>
              </View>
            </View>

            {/* Form Fields */}
            <View className="space-y-4">
              <InputField
                label="Full Name"
                value={name}
                onChangeText={setName}
                editable={isEditing}
                placeholder="Enter your full name"
              />

              <View className="flex-row space-x-4">
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

              <View className="mb-4">
                <Text className={`text-sm font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  Institution
                </Text>
                <View className={`flex-row items-center justify-between px-4 py-3.5 rounded-xl border ${isDark ? "bg-gray-900/50 border-gray-700" : "bg-gray-50 border-gray-200"
                  }`}>
                  <Text className={`text-base ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    {typeof user?.institution === "string" ? user?.institution : user.institution?.name || "N/A"}
                  </Text>
                  <Ionicons name="lock-closed" size={16} color={isDark ? "#6B7280" : "#9CA3AF"} />
                </View>
                {isEditing && (
                  <Text className="text-xs text-gray-400 mt-1 ml-1">
                    Contact system administrator to change institution.
                  </Text>
                )}
              </View>
            </View>

            {/* Action Buttons */}
            {isEditing && (
              <View className="flex-row gap-3 mt-6">
                <TouchableOpacity
                  onPress={() => {
                    setIsEditing(false);
                    setName(user.name);
                    setDepartment(user.department || "");
                    setDesignation(user.designation || "");
                  }}
                  className={`flex-1 py-3.5 rounded-xl items-center border ${isDark ? "border-gray-600" : "border-gray-300"
                    }`}
                >
                  <Text className={`font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSave}
                  disabled={submitting}
                  className="flex-1 bg-blue-600 py-3.5 rounded-xl items-center shadow-lg shadow-blue-600/20"
                >
                  {submitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold">Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AdminProfile;
