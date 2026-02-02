import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { Platform, TouchableOpacity, View, useColorScheme } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function ModernTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    // Filter out hidden screens (href: null) OR screens without icons (since this is icon-only bar)
    const visibleRoutes = state.routes.filter((route) => {
        const { options } = descriptors[route.key];
        // @ts-ignore
        if (options.href === null) return false;
        if (options.tabBarIcon === undefined) return false;
        return true;
    });

    return (
        <View
            className="absolute left-5 right-5"
            style={{
                bottom: Platform.OS === "ios" ? insets.bottom : 6,
                // On Android, bottom 24 is usually fine. On iOS, we want it above the home bar.
            }}
        >
            <View
                className="flex-row items-center justify-between bg-background dark:bg-dark-background rounded-3xl shadow-xl shadow-black/20 dark:shadow-black/50 py-3 px-6 border border-border/50 dark:border-border/10"
                style={{
                    height: 70, // Fixed height for consistency
                }}
            >
                {visibleRoutes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === state.routes.indexOf(route);

                    const onPress = () => {
                        const event = navigation.emit({
                            type: "tabPress",
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    return (
                        <TabItem
                            key={route.key}
                            isFocused={isFocused}
                            options={options}
                            onPress={onPress}
                            isDark={isDark}
                        />
                    );
                })}
            </View>
        </View>
    );
}

function TabItem({ isFocused, options, onPress, isDark }: any) {
    const scale = useSharedValue(0);

    React.useEffect(() => {
        scale.value = withSpring(isFocused ? 1 : 0, { duration: 350 });
    }, [isFocused]);

    const animatedIconStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: withSpring(isFocused ? 1.2 : 1) }],
            top: withSpring(isFocused ? -5 : 0), // Slight float up on active
        };
    });

    const animatedIndicatorStyle = useAnimatedStyle(() => {
        return {
            opacity: withTiming(isFocused ? 1 : 0),
            transform: [{ scale: scale.value }],
        }
    })

    // Get icon
    const Icon = options.tabBarIcon
        ? options.tabBarIcon({
            focused: isFocused,
            color: isFocused
                ? (isDark ? "#60A5FA" : "#2563EB") // Primary Active
                : (isDark ? "#9CA3AF" : "#6B7280"), // Muted Inactive
            size: 26, // Slightly larger icons
        })
        : null;

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="items-center justify-center h-full"
            style={{ width: 50 }} // Fixed touch target width for consistent spacing
        >
            <Animated.View style={animatedIconStyle}>
                {Icon}
            </Animated.View>

            {/* Active Indicator Dot - positioned absolutely below */}
            <Animated.View
                style={animatedIndicatorStyle}
                className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-blue-400 absolute bottom-2"
            />
        </TouchableOpacity>
    );
}
