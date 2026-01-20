import { Link, Stack, useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../store/hooks/useAuth";

const ProfileItem = ({ label, value }: { label: string; value: string | undefined }) => (
    <View className="mb-4">
        <Text className="text-sm text-textSecondary dark:text-dark-textSecondary mb-1 font-medium">{label}</Text>
        <Text className="text-lg text-textPrimary dark:text-dark-textPrimary font-semibold">{value || "N/A"}</Text>
    </View>
);

const Profile = () => {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.replace("/");
    };

    return (
        <View className="flex-1 bg-background dark:bg-dark-background">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="px-6 py-4 border-b border-border dark:border-dark-border flex-row items-center justify-between">
                <Link href=".." asChild>
                    <TouchableOpacity>
                        <Text className="text-primary dark:text-dark-primary text-lg">← Back</Text>
                    </TouchableOpacity>
                </Link>
                <Text className="text-xl font-bold text-textPrimary dark:text-dark-textPrimary">
                    My Profile
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView className="px-6 py-6">

                {/* Avatar Placeholder */}
                <View className="items-center mb-8">
                    <View className="w-24 h-24 bg-primary/20 rounded-full items-center justify-center mb-4">
                        <Text className="text-3xl font-bold text-primary">
                            {user?.name?.charAt(0) || "S"}
                        </Text>
                    </View>
                    <Text className="text-2xl font-bold text-textPrimary dark:text-dark-textPrimary">
                        {user?.name}
                    </Text>
                    <Text className="text-base text-textSecondary dark:text-dark-textSecondary font-medium">
                        Student
                    </Text>
                </View>

                {/* Info Grid */}
                <View className="bg-card dark:bg-dark-card p-6 rounded-2xl border border-border dark:border-dark-border mb-6">
                    <ProfileItem label="Email" value={user?.email} />
                    <ProfileItem label="Institution" value={user?.institution?.name} />
                    {/* Add more student specific fields if available in user object */}
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    onPress={handleLogout}
                    className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl items-center border border-red-100 dark:border-red-900/50"
                >
                    <Text className="text-red-600 dark:text-red-400 font-bold text-lg">
                        Log Out
                    </Text>
                </TouchableOpacity>

                <Text className="text-center text-sm text-textSecondary dark:text-dark-textSecondary mt-8 pb-10">
                    Version 1.0.0
                </Text>

            </ScrollView>
        </View>
    );
};

export default Profile;
