import { useAuth } from '@/store/hooks/useAuth';
import { useTheme } from '@/store/hooks/useTheme';
import { showAlert } from '@/utils/alert';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export type SidebarItem = {
    label: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap | keyof typeof Ionicons.glyphMap;
    iconLibrary?: 'Ionicons' | 'MaterialCommunityIcons';
    route: string;
};

interface SidebarProps {
    items: SidebarItem[];
    header?: React.ReactNode;
    compact?: boolean;
    onNavigate?: () => void;
}

export const Sidebar = ({ items, header, compact, onNavigate }: SidebarProps) => {
    const { isDark } = useTheme();
    const router = useRouter();
    const pathname = usePathname();
    const { logout } = useAuth();

    const isActive = (route: string) => {
        if (route === '/' || route.endsWith('/dashboard') || route.endsWith('/index')) {
            // Handle root paths match strictly or if exact match
            return pathname === route;
        }
        return pathname.includes(route);
    };

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

    return (
        <View className={`h-full border-r ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
            {header && <View className="p-6">{header}</View>}

            <ScrollView className="flex-1 px-4 py-4">
                <Text className={`text-xs font-bold mb-4 uppercase ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    Menu
                </Text>

                {items.map((item, index) => {
                    const active = isActive(item.route);
                    const IconComponent = item.iconLibrary === 'Ionicons' ? Ionicons : MaterialCommunityIcons;

                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={() => {
                                router.push(item.route as any);
                                onNavigate?.();
                            }}
                            className={`flex-row items-center p-3 mb-2 rounded-xl transition-colors ${active
                                ? isDark ? "bg-blue-600/20" : "bg-blue-50"
                                : "hover:bg-gray-100 dark:hover:bg-gray-800"
                                }`}
                        >
                            <View className={`${active ? "" : "opacity-70"}`}>
                                <IconComponent
                                    name={item.icon as any}
                                    size={22}
                                    color={active ? "#2563EB" : (isDark ? "#9CA3AF" : "#6B7280")}
                                />
                            </View>
                            <Text
                                className={`ml-3 font-medium ${compact ? "hidden" : ""
                                    } ${active
                                        ? isDark ? "text-blue-400" : "text-blue-700"
                                        : isDark ? "text-gray-400" : "text-gray-600"
                                    }`}
                            >
                                {item.label}
                            </Text>

                            {active && (
                                <View className={`absolute left-0 w-1 h-6 rounded-r-full bg-blue-600`} />
                            )}
                        </TouchableOpacity>
                    );
                })}


                <View className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                    <Text className={`text-xs font-bold mb-4 ${compact ? "hidden" : ""} uppercase ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        System
                    </Text>
                    <TouchableOpacity
                        onPress={handleLogout} // Or logout logic
                        className="flex-row items-center p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10"
                    >
                        <MaterialCommunityIcons name="logout" size={22} color={isDark ? "#EF4444" : "#DC2626"} />
                        <Text className={`ml-3 ${compact ? "hidden" : ""} font-medium ${isDark ? "text-red-400" : "text-red-600"}`}>Logout</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
};
