import { Stack } from "expo-router";
import { useAuthGuard } from "../../hooks/useAuthGuard";

export default function StudentLayout() {
  const guard = useAuthGuard(["STUDENT"]);
  if (guard) return guard;

  return <Stack screenOptions={{ headerShown: false }} />;
}
