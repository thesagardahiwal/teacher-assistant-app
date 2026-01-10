import { Stack } from "expo-router";
import { useAdminOnboardingGuard } from "../../hooks/useAdminOnboardingGuard";
import { useAuthGuard } from "../../hooks/useAuthGuard";

export default function AdminLayout() {
  useAuthGuard(["ADMIN"]);
  useAdminOnboardingGuard();

  return <Stack screenOptions={{ headerShown: false }} />;
}
