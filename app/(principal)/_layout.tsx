import { Stack } from "expo-router";
import { useAuthGuard } from "../../hooks/useAuthGuard";

export default function PrincipalLayout() {
  const guard = useAuthGuard(["PRINCIPAL", "VICE_PRINCIPAL"]);
  if (guard) return guard;

  return <Stack screenOptions={{ headerShown: false }} />;
}
