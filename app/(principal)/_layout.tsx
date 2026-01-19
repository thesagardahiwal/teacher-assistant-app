import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuthGuard } from "../../hooks/useAuthGuard";

export default function PrincipalLayout() {
  const { isAuthorized, isLoading } = useAuthGuard(["PRINCIPAL", "VICE_PRINCIPAL"]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthorized) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
