import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../store/hooks/useAuth";

export const useAuthGuard = (allowedRoles?: string[]) => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/(auth)/login");
      return;
    }

    if (
      !isLoading &&
      allowedRoles &&
      role &&
      !allowedRoles.includes(role)
    ) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, role]);

  return null;
};
