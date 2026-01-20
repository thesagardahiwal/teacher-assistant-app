import { useColorScheme } from "react-native";


export const useTheme = () => {
    const theme = useColorScheme();
    return {
        isDark: theme === "dark",
        isLight: theme === "light",
        colors: {
            primary: theme === "dark" ? "#FFFFFF" : "#000000",
            background: theme === "dark" ? "#1F2937" : "#FFFFFF",
            card: theme === "dark" ? "#374151" : "#F3F4F6",
            text: theme === "dark" ? "#F9FAFB" : "#111827",
            border: theme === "dark" ? "#4B5563" : "#E5E7EB",
        }
    }
}