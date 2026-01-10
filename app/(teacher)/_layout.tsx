import { Stack } from "expo-router";
import { useAuthGuard } from "../../hooks/useAuthGuard";

export default function TeacherLayout() {
  const guard = useAuthGuard(["TEACHER"]);
  if (guard) return guard;

  return <Stack screenOptions={{ headerShown: false }} />;
}
