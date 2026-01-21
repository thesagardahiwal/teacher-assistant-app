import SafeAreaProtector from "@/components/SafeAreaProtector";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, useColorScheme, View } from "react-native";
import { Provider } from "react-redux";
import "../global.css";
import { store } from "../store";
import { useAuth } from "../store/hooks/useAuth";

function RootLayoutInner() {
  const { restoreSession, isLoading } = useAuth();
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
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(teacher)" />
      <Stack.Screen name="(student)" />
      <Stack.Screen name="(principal)" />
      <Stack.Screen name="(admin)" />
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <SafeAreaProtector>
          <RootLayoutInner />
        </SafeAreaProtector>
      </ThemeProvider>
    </Provider>
  );
}
