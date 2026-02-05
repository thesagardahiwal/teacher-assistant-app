import { Redirect, Stack, useSegments } from "expo-router";
import { useAuth } from "../../store/hooks/useAuth";

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const isInviteRoute = segments.some(segment => segment === 'invite');

  if (isAuthenticated && !isInviteRoute) {
    return <Redirect href="/" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="invite" />
    </Stack>
  );
}
