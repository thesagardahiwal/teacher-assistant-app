import { Stack } from "expo-router";
import ProtectedRoute from "../../components/auth/ProtectedRoute";

export default function AdminLayout() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <Stack screenOptions={{ headerShown: false }} />
    </ProtectedRoute>
  );
}
