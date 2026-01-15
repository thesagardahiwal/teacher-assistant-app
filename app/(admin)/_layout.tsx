import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAdminOnboardingGuard } from "../../hooks/useAdminOnboardingGuard";
import { useAuthGuard } from "../../hooks/useAuthGuard";

export default function AdminLayout() {
  const { isAuthorized, isLoading } = useAuthGuard(["ADMIN", "PRINCIPAL", "VICE_PRINCIPAL"]);
  useAdminOnboardingGuard();

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
