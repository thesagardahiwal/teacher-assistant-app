import { authService } from "@/services/appwrite/auth.service";
import { account } from "@/services/appwrite/client";
import { COLLECTIONS } from "@/services/appwrite/collections";
import { databaseService } from "@/services/appwrite/database.service";
import { invitationService } from "@/services/invitation.service";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ID, Query } from "react-native-appwrite";

export default function InviteScreen() {
    const { token } = useLocalSearchParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [inviteData, setInviteData] = useState<any>(null);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            validateToken(token as string);
        } else {
            setError("Invalid invitation link");
            setLoading(false);
        }
    }, [token]);

    const validateToken = async (tokenStr: string) => {
        try {
            const res = await invitationService.validate(tokenStr);
            if (res.documents.length === 0) {
                setError("Invalid or expired invitation link");
            } else {
                setInviteData(res.documents[0]);
            }
        } catch (e) {
            setError("Failed to validate invitation");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }
        if (password.length < 8) {
            Alert.alert("Error", "Password must be at least 8 characters");
            return;
        }

        setSubmitting(true);
        try {
            // 1. Create Appwrite Auth Account
            const user = await account.create(
                ID.unique(),
                inviteData.email,
                password,
                "User"
            );

            // 2. Find Pending Profile
            const collectionId = inviteData.role === "STUDENT" ? COLLECTIONS.STUDENTS : COLLECTIONS.USERS;

            const profiles = await databaseService.list(
                collectionId,
                [Query.equal("userId", `invite:${inviteData.token}`)]
            );

            if (profiles.documents.length === 0) {
                throw new Error("Profile not found for this invitation.");
            }

            const pendingProfile = profiles.documents[0];

            // 3. Create New Profile with Auth ID
            // Strip system fields
            const { $id, $createdAt, $updatedAt, $permissions, $collectionId: cId, $databaseId, ...data } = pendingProfile;

            try {
                // 1-3. Your existing operations (assuming they succeed or throw)
                await databaseService.createUserDocument(
                    collectionId,
                    user.$id,
                    {
                        ...data,
                        userId: user.$id,
                        isActive: true,
                    },
                );
                await databaseService.delete(collectionId, pendingProfile.$id);
                await invitationService.markUsed(inviteData.$id);

                // If all succeed, return or continue
            } catch (error) {
                // Rollback in reverse order (idempotent operations preferred)

                // Revert markUsed if possible (custom undo in invitationService)
                await invitationService.unmarkUsed?.(inviteData.$id).catch(() => { }); // Optional, non-blocking

                // Recreate pending profile if deleted
                await databaseService.create(collectionId, data, undefined, pendingProfile.$id).catch(() => { });

                // Delete user document if created
                await databaseService.delete(collectionId, user.$id).catch(() => { }); // Assumes same collection

                // Re-throw or handle error
                console.error('Transaction failed, rolled back:', error);
                throw error;
            }

            // 6. Login
            await authService.login(inviteData.email, password);

            Alert.alert("Success", "Account activated successfully!", [
                { text: "OK", onPress: () => router.replace("/") }
            ]);

        } catch (e: any) {
            Alert.alert("Error", e.message || "Failed to activate account");
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center bg-white px-6">
                <Text className="text-red-500 text-lg text-center mb-4">{error}</Text>
                <TouchableOpacity onPress={() => router.replace("/(auth)/login")} className="bg-blue-600 px-6 py-3 rounded-xl">
                    <Text className="text-white font-bold">Go to Login</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white px-6 justify-center">
            <View className="w-full max-w-sm mx-auto">
                <Text className="text-2xl font-bold text-gray-900 mb-2">Welcome!</Text>
                <Text className="text-gray-500 mb-8">
                    Set your password to accept the invitation for {inviteData?.email}
                </Text>

                <View className="space-y-4">
                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-1">New Password</Text>
                        <TextInput
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                            secureTextEntry={true}
                            placeholder="Min 8 characters"
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-1">Confirm Password</Text>
                        <TextInput
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                            secureTextEntry={true}
                            placeholder="Re-enter password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleAccept}
                        disabled={submitting}
                        className={`w-full py-4 rounded-xl items-center mt-6 ${submitting ? "bg-blue-400" : "bg-blue-600"}`}
                    >
                        {submitting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Activate Account</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
