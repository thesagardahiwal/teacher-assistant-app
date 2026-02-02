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
import Animated, { FadeInDown } from "react-native-reanimated";

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
            <View className="flex-1 justify-center items-center bg-background dark:bg-dark-background">
                <ActivityIndicator size="large" color={isDark ? "#4C8DFF" : "#2563EB"} />
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center px-6 bg-background dark:bg-dark-background">
                <View className="bg-error/10 p-4 rounded-full mb-4">
                    <Ionicons name="alert-circle" size={48} color="#DC2626" />
                </View>
                <Text className="text-error text-lg text-center mb-6 font-medium">{error}</Text>
                <TouchableOpacity onPress={() => router.replace("/(auth)/login")} className="bg-primary dark:bg-dark-primary px-8 py-3 rounded-xl shadow-lg shadow-primary/30">
                    <Text className="text-white font-bold text-lg">Go to Login</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const content = (
        <View className="flex-1 justify-center px-6">
            <Animated.View
                entering={FadeInDown.delay(100).springify()}
                className="w-full max-w-sm md:max-w-md self-center"
            >
                {/* Header */}
                <View className="items-center mb-8">
                    <View className="w-16 h-16 rounded-2xl bg-success/10 items-center justify-center mb-4">
                        <Ionicons name="mail-open" size={32} color="#16A34A" />
                    </View>
                    <Text className="text-3xl font-bold text-center text-textPrimary dark:text-dark-textPrimary">
                        Welcome!
                    </Text>
                    <Text className="text-base text-center text-textSecondary dark:text-dark-textSecondary mt-2">
                        Set your password to accept the invitation for <Text className="font-semibold text-textPrimary dark:text-dark-textPrimary">{inviteData?.email}</Text>
                    </Text>
                </View>

                <View className="gap-4">
                    <View>
                        <Text className="text-sm font-medium text-textSecondary dark:text-dark-textSecondary mb-1.5 ml-1">New Password</Text>
                        <View className="relative">
                            <TextInput
                                className="bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded-xl px-4 py-3.5 text-textPrimary dark:text-dark-textPrimary pr-12 text-base"
                                secureTextEntry={!showPassword}
                                placeholder="Min 8 characters"
                                placeholderTextColor={isDark ? "#9CA3AF" : "#94A3B8"}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-3.5"
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
                        <Text className="text-sm font-medium text-textSecondary dark:text-dark-textSecondary mb-1.5 ml-1">Confirm Password</Text>
                        <View className="relative">
                            <TextInput
                                className="bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded-xl px-4 py-3.5 text-textPrimary dark:text-dark-textPrimary pr-12 text-base"
                                secureTextEntry={!showConfirmPassword}
                                placeholder="Re-enter password"
                                placeholderTextColor={isDark ? "#9CA3AF" : "#94A3B8"}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-3.5"
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
                        activeOpacity={0.9}
                        className={`w-full py-4 rounded-xl items-center mt-6 shadow-md shadow-primary/20 ${submitting ? "bg-primary/70 dark:bg-dark-primary/70" : "bg-primary dark:bg-dark-primary"}`}
                    >
                        {submitting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Activate Account</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-background dark:bg-dark-background"
        >
            {Platform.OS === "web" ? content : (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    {content}
                </TouchableWithoutFeedback>
            )}
        </KeyboardAvoidingView>
    );
}
