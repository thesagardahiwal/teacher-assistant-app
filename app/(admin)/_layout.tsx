import { Stack } from "expo-router";
import { View } from "react-native";
import { useAdminOnboardingGuard } from "../../hooks/useAdminOnboardingGuard";
import { useAuthGuard } from "../../hooks/useAuthGuard";

export default function AdminLayout() {
  const { isAuthorized } = useAuthGuard(["ADMIN", "PRINCIPAL", "VICE_PRINCIPAL"]);
  useAdminOnboardingGuard();

  if (!isAuthorized) return <View />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
