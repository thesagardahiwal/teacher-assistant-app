import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
      <View className="flex-1 justify-center items-center bg-background dark:bg-dark-background">
        <ActivityIndicator size="large" color={isDark ? "#ffffff" : "#2563EB"} />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background dark:bg-dark-background">
      {/* Header */}
      <View className="px-6 py-6 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color={isDark ? "#FFFFFF" : "#000000"} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-textPrimary dark:text-dark-textPrimary">My Profile</Text>
        <TouchableOpacity onPress={handleLogout} className="p-2 -mr-2">
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View className="px-6 pb-10">

        {/* Avatar / Initials */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 rounded-full bg-primary dark:bg-dark-primary items-center justify-center mb-4">
            <Text className="text-4xl font-bold text-white">{user.name?.charAt(0) || "A"}</Text>
          </View>
          <Text className="text-2xl font-bold text-textPrimary dark:text-dark-textPrimary">{user.name}</Text>
          <Text className="text-textSecondary dark:text-dark-textSecondary">{user.email}</Text>
          <View className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full mt-2">
            <Text className="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">{user.role}</Text>
          </View>
        </View>

        {/* Edit Toggle */}
        <View className="flex-row justify-end mb-4">
          {!isEditing && (
            <TouchableOpacity onPress={() => setIsEditing(true)} className="flex-row items-center bg-card dark:bg-dark-card border border-border dark:border-dark-border px-4 py-2 rounded-full">
              <Ionicons name="create-outline" size={18} color={isDark ? "#FFFFFF" : "#000000"} style={{ marginRight: 8 }} />
              <Text className="text-textPrimary dark:text-dark-textPrimary font-medium">Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Form Fields */}
        <View className="gap-4">
          <View>
            <Text className="text-sm font-medium text-textSecondary dark:text-dark-textSecondary mb-1">Full Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              editable={isEditing}
              className={`bg-card dark:bg-dark-card text-textPrimary dark:text-dark-textPrimary border ${isEditing ? "border-primary dark:border-dark-primary" : "border-border dark:border-dark-border"} rounded-xl px-4 py-3`}
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-textSecondary dark:text-dark-textSecondary mb-1">Department</Text>
            <TextInput
              value={department}
              onChangeText={setDepartment}
              editable={isEditing}
              placeholder="e.g. Science"
              placeholderTextColor={isDark ? "#9CA3AF" : "#94A3B8"}
              className={`bg-card dark:bg-dark-card text-textPrimary dark:text-dark-textPrimary border ${isEditing ? "border-primary dark:border-dark-primary" : "border-border dark:border-dark-border"} rounded-xl px-4 py-3`}
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-textSecondary dark:text-dark-textSecondary mb-1">Designation</Text>
            <TextInput
              value={designation}
              onChangeText={setDesignation}
              editable={isEditing}
              placeholder="e.g. Principal"
              placeholderTextColor={isDark ? "#9CA3AF" : "#94A3B8"}
              className={`bg-card dark:bg-dark-card text-textPrimary dark:text-dark-textPrimary border ${isEditing ? "border-primary dark:border-dark-primary" : "border-border dark:border-dark-border"} rounded-xl px-4 py-3`}
            />
          </View>

          {/* Read-only Institution Info */}
          <View>
            <Text className="text-sm font-medium text-textSecondary dark:text-dark-textSecondary mb-1">Institution</Text>
            <View className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 flex-row items-center justify-between">
              <Text className="text-gray-500 dark:text-gray-400">{typeof user?.institution === "string" ? user?.institution : user.institution?.name || "N/A"}</Text>
              <Ionicons name="lock-closed-outline" size={16} color={isDark ? "#9CA3AF" : "#9CA3AF"} />
            </View>
            <Text className="text-xs text-muted dark:text-dark-muted mt-1 ml-1">Contact support to change institution details.</Text>
          </View>
        </View>

        {/* Action Buttons */}
        {isEditing && (
          <View className="flex-row mt-8 gap-4">
            <TouchableOpacity onPress={() => { setIsEditing(false); setName(user.name); setDepartment(user.department || ""); setDesignation(user.designation || ""); }} className="flex-1 bg-gray-200 dark:bg-gray-700 py-3 rounded-xl items-center">
              <Text className="text-gray-700 dark:text-gray-200 font-bold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} disabled={submitting} className="flex-1 bg-primary dark:bg-dark-primary py-3 rounded-xl items-center">
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold">Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

      </View>
    </ScrollView>
  );
};

export default AdminProfile;
