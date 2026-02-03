import { useColorScheme } from "nativewind";


export const useTheme = () => {
    const { colorScheme } = useColorScheme();
    return {
        isDark: colorScheme === "dark",
        isLight: colorScheme === "light",
        colors: {
            primary: colorScheme === "dark" ? "#4C8DFF" : "#1A73E8",
            background: colorScheme === "dark" ? "#0B1220" : "#F9FAFB",
            card: colorScheme === "dark" ? "#111827" : "#FFFFFF",
            text: colorScheme === "dark" ? "#E5E7EB" : "#0F172A",
            border: colorScheme === "dark" ? "#1F2937" : "#E5E7EB",
        }
    }
}