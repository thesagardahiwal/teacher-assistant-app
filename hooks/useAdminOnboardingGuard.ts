import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../store/hooks/useAuth";

export const useAdminOnboardingGuard = () => {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (role === "ADMIN") {
      router.replace("/(admin)/dashboard");
    }
  }, [isLoading, role, user]);

  return null;
};
