import { useColorScheme } from "react-native";

export type ThemeMode = "light" | "dark";

export const useThemeMode = () => {
  const scheme = useColorScheme(); // 'light' | 'dark' | null

  const colorScheme: ThemeMode =
    scheme === "dark" ? "dark" : "light";

  return {
    colorScheme,
    isDark: colorScheme === "dark",
  };
};
