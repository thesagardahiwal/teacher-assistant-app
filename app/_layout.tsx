import SafeAreaProtector from "@/components/SafeAreaProtector";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
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
  }, []);

  if (!ready || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Expo Router handles redirection via index.tsx */}
      <Stack.Screen name="index" />
    </Stack>
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
