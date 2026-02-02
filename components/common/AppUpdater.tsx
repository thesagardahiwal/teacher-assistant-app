import { Ionicons } from "@expo/vector-icons";
import * as Updates from "expo-updates";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../store/hooks/useTheme";

export function AppUpdater() {
    const { isDark } = useTheme();
    const [isChecking, setIsChecking] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [lastCheck, setLastCheck] = useState<Date | null>(null);

    async function checkForUpdates() {
        if (__DEV__) {
            Alert.alert("Development Mode", "Updates are not available in development mode.");
            return;
        }

        try {
            setIsChecking(true);
            const update = await Updates.checkForUpdateAsync();

            if (update.isAvailable) {
                Alert.alert(
                    "Update Available",
                    "A new version of the app is available. Would you like to download and install it now?",
                    [
                        { text: "Cancel", style: "cancel" },
                        {
                            text: "Update",
                            onPress: async () => {
                                await fetchUpdate();
                            },
                        },
                    ]
                );
            } else {
                Alert.alert("No Updates", "You are using the latest version.");
            }
            setLastCheck(new Date());
        } catch (error) {
            console.error("Error checking for updates:", error);
            Alert.alert("Error", "Failed to check for updates");
        } finally {
            setIsChecking(false);
        }
    }

    async function fetchUpdate() {
        try {
            setIsDownloading(true);
            await Updates.fetchUpdateAsync();
            Alert.alert(
                "Update Ready",
                "The app has been updated. Relauch to apply changes.",
                [
                    {
                        text: "Restart Now",
                        onPress: async () => {
                            await Updates.reloadAsync();
                        },
                    },
                ]
            );
        } catch (error) {
            console.error("Error fetching update:", error);
            Alert.alert("Error", "Failed to download update");
        } finally {
            setIsDownloading(false);
        }
    }

    // Auto-check on mount
    useEffect(() => {
        if (!__DEV__) {
            checkForUpdates();
        }
    }, []);

    return (
        <View className={`border-t ${isDark ? "border-gray-800" : "border-gray-200"} mt-4 pt-4`}>
            <Text className={`text-xs font-bold uppercase mb-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                App Updates
            </Text>

            <TouchableOpacity
                onPress={checkForUpdates}
                disabled={isChecking || isDownloading}
                className={`flex-row items-center justify-between p-4 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                    }`}
            >
                <View className="flex-row items-center">
                    <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${isDark ? "bg-blue-900/30" : "bg-blue-50"
                        }`}>
                        <Ionicons name="cloud-download-outline" size={18} color={isDark ? "#60A5FA" : "#2563EB"} />
                    </View>
                    <View>
                        <Text className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                            Check for Updates
                        </Text>
                        <Text className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            {lastCheck ? `Checked: ${lastCheck.toLocaleTimeString()}` : "Tap to check manually"}
                        </Text>
                    </View>
                </View>

                {isChecking || isDownloading ? (
                    <ActivityIndicator size="small" color="#2563EB" />
                ) : (
                    <Ionicons name="chevron-forward" size={20} color={isDark ? "#6B7280" : "#9CA3AF"} />
                )}
            </TouchableOpacity>
        </View>
    );
}
