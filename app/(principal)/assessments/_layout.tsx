import { Stack } from "expo-router";
import { useTheme } from "../../../store/hooks/useTheme";

export default function AssessmentsLayout() {
    const { isDark } = useTheme();

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: isDark ? "#111827" : "#F9FAFB" },
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="create" options={{ presentation: 'modal' }} />
            <Stack.Screen name="[id]" />
        </Stack>
    );
}
