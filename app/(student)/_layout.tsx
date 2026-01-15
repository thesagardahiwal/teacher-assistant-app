import { Stack } from "expo-router";
import { View } from "react-native";
import { useAuthGuard } from "../../hooks/useAuthGuard";

export default function StudentLayout() {
  const { isAuthorized } = useAuthGuard(["STUDENT"]);
  if (!isAuthorized) return <View />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
