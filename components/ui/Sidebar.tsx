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
        <View className={`h-full border-r dark:bg-[#020617] dark:border-slate-800 bg-white border-slate-200`}>
            {header && <View className="p-6">{header}</View>}

            <ScrollView className="flex-1 px-4 py-2" showsVerticalScrollIndicator={false}>
                <Text className={`text-xs font-bold mb-4 px-2 uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}>
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
                            className={`flex-row items-center p-3 mb-2 rounded-xl transition-all duration-200 group ${active
                                ? isDark ? "bg-blue-500/10" : "bg-blue-50"
                                : "hover:bg-slate-50 dark:hover:bg-white/5"
                                }`}
                        >
                            <View className={`${active ? "" : "opacity-70 group-hover:opacity-100 transition-opacity"}`}>
                                <IconComponent
                                    name={item.icon as any}
                                    size={20}
                                    color={active ? "#2563EB" : (isDark ? "#94a3b8" : "#64748b")}
                                />
                            </View>
                            <Text
                                className={`ml-3 font-medium text-sm ${compact ? "hidden" : ""
                                    } ${active
                                        ? isDark ? "text-blue-400 font-bold" : "text-blue-600 font-bold"
                                        : isDark ? "text-slate-400 group-hover:text-slate-200" : "text-slate-600 group-hover:text-slate-900"
                                    }`}
                            >
                                {item.label}
                            </Text>

                            {active && (
                                <View className={`absolute left-0 w-1 h-6 rounded-r-full bg-blue-600 shadow-sm shadow-blue-500/50`} />
                            )}
                        </TouchableOpacity>
                    );
                })}


                <View className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800 pb-8">
                    <Text className={`text-xs font-bold mb-4 px-2 uppercase tracking-wider ${compact ? "hidden" : ""} ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        System
                    </Text>
                    <TouchableOpacity
                        onPress={handleLogout}
                        className="flex-row items-center p-3 rounded-xl transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/10 group"
                    >
                        <MaterialCommunityIcons
                            name="logout"
                            size={20}
                            className="text-slate-400 group-hover:text-red-500 transition-colors"
                            color={isDark ? "#94a3b8" : "#94a3b8"}
                        />
                        <Text className={`ml-3 ${compact ? "hidden" : ""} font-medium text-sm text-slate-500 dark:text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors`}>
                            Logout
                        </Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
};
