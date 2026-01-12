import { useColorScheme } from "react-native";


export const useTheme = () => {
    const theme = useColorScheme();
    return {
        isDark: theme === "dark",
        isLight: theme === "light"
    }
}