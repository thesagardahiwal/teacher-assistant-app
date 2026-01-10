import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../store/hooks/useAuth";
import { isAdminProfileComplete } from "../utils/profileCompletion";

export const useAdminOnboardingGuard = () => {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && role === "ADMIN" && !isAdminProfileComplete(user)) {
      router.replace("/(admin)/profile");
    }
  }, [isLoading, role, user]);

  return null;
};
