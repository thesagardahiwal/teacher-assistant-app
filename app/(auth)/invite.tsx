import { account } from "@/services/appwrite/client";
import { COLLECTIONS } from "@/services/appwrite/collections";
import { databaseService } from "@/services/appwrite/database.service";
import { invitationService } from "@/services/invitation.service";
import { useAuth } from "@/store/hooks/useAuth";
import { useTheme } from "@/store/hooks/useTheme";
import { Invitation } from "@/types/invitations.type";
import { showAlert } from "@/utils/alert";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

import { ID } from "react-native-appwrite";

export default function InviteScreen() {
    const { token } = useLocalSearchParams();
    const router = useRouter();
    const { login } = useAuth();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [inviteData, setInviteData] = useState<Invitation | null>(null);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { isDark } = useTheme();
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
                setInviteData(res.documents[0] as unknown as Invitation);
            }
        } catch (e) {
            setError("Failed to validate invitation");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        if (password !== confirmPassword) {
            showAlert("Error", "Passwords do not match");
            return;
        }
        if (password.length < 8) {
            showAlert("Error", "Password must be at least 8 characters");
            return;
        };

        if (!inviteData) {
            showAlert("Error", "Invalid invitation");
            return;
        };

        setSubmitting(true);
        try {
            // 1. Create Appwrite Auth Account
            try {
                await account.deleteSessions();
            } catch (e) {
                // Ignore if no session
            }

            const newUserId = inviteData.userId || ID.unique();
            try {
                await account.create(
                    newUserId,
                    inviteData.email,
                    password,
                    "User"
                );
            } catch (error) {
                console.error("Failed to create account:", error);
                throw error;
            }

            // 2. Find Pending Profile
            const collectionId = inviteData.role === "STUDENT" ? COLLECTIONS.STUDENTS : COLLECTIONS.USERS;

            await login(inviteData.email, password, inviteData.role === "STUDENT" ? "student" : "teacher").unwrap();

            try {
                // Use the same userId we used for account creation
                await databaseService.update(collectionId, newUserId, {
                    isActive: true,
                });
                await invitationService.markUsed(inviteData.$id);
            } catch (error) {
                await invitationService.unmarkUsed?.(inviteData.$id).catch(() => { }); // Optional, non-blocking
                console.error('Transaction failed, rolled back:', error);
            }

            // 6. Login

            showAlert("Success", "Account activated successfully!", [
                {
                    text: "OK", onPress: () => {
                        router.replace("/");
                    }
                }
            ]);

        } catch (e: any) {
            showAlert("Error", e.message || "Failed to activate account");
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
            <View className="flex-1 justify-center items-center px-6">
                <Text className="text-red-500 text-lg text-center mb-4">{error}</Text>
                <TouchableOpacity onPress={() => router.replace("/(auth)/login")} className="bg-blue-600 px-6 py-3 rounded-xl">
                    <Text className="text-white font-bold">Go to Login</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const content = (
        <View className="w-full max-w-sm mx-auto">
            <Text className="text-2xl font-bold text-textPrimary dark:text-dark-textPrimary mb-2">Welcome!</Text>
            <Text className="text-gray-500 text-textPrimary dark:text-dark-textPrimary mb-8">
                Set your password to accept the invitation for {inviteData?.email}
            </Text>

            <View className="space-y-4">
                <View>
                    <Text className="text-sm font-medium text-textPrimary dark:text-dark-textPrimary mb-1">New Password</Text>
                    <View className="relative mb-3">
                        <TextInput
                            className="bg-card dark:bg-dark-card border border-border dark:border-dark-border rounded-xl px-4 py-4 text-textPrimary dark:text-dark-textPrimary pr-12"
                            secureTextEntry={!showPassword}
                            placeholder="Min 8 characters"
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-4"
                            testID="toggle-password"
                        >
                            <Ionicons
                                name={showPassword ? "eye-off" : "eye"}
                                size={24}
                                color={isDark ? "#9CA3AF" : "#94A3B8"}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <View>
                    <Text className="text-sm font-medium text-textPrimary dark:text-dark-textPrimary mb-1">Confirm Password</Text>
                    <View className="relative">
                        <TextInput
                            className="bg-card dark:bg-dark-card border border-border dark:border-dark-border rounded-xl px-4 py-4 text-textPrimary dark:text-dark-textPrimary pr-12"
                            secureTextEntry={!showConfirmPassword}
                            placeholder="Re-enter password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                        <TouchableOpacity
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-4"
                            testID="toggle-password"
                        >
                            <Ionicons
                                name={showConfirmPassword ? "eye-off" : "eye"}
                                size={24}
                                color={isDark ? "#9CA3AF" : "#94A3B8"}
                            />
                        </TouchableOpacity>
                    </View>
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
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 px-6 justify-center"
        >
            {Platform.OS === "web" ? content : (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    {content}
                </TouchableWithoutFeedback>
            )}
        </KeyboardAvoidingView>
    );
}
