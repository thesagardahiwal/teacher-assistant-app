import { Stack } from "expo-router";
import ProtectedRoute from "../../components/auth/ProtectedRoute";

export default function StudentLayout() {
  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <Stack screenOptions={{ headerShown: false }} />
    </ProtectedRoute>
  );
}
