import SafeAreaProtector from "@/components/SafeAreaProtector";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Provider } from "react-redux";
import "../global.css";
import { useThemeMode } from "../hooks/useThemeMode";
import { store } from "../store";
import { useAuth } from "../store/hooks/useAuth";

function RootLayoutInner() {
  const { restoreSession, isLoading } = useAuth();
  const { isDark } = useThemeMode();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await restoreSession();
      setReady(true);
    };
    init();
  }, [restoreSession]);

  if (!ready || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }


  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Expo Router handles redirection via index.tsx */}
        <Stack.Screen name="index" />
        <Stack.Screen name="(teacher)" />
        <Stack.Screen name="(student)" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <SafeAreaProtector>
        <RootLayoutInner />
      </SafeAreaProtector>
    </Provider>
  );
}
