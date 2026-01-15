import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useAuth } from "../store/hooks/useAuth";

export const useAuthGuard = (allowedRoles?: string[]) => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/(auth)/login");
      setIsAuthorized(false);
      return;
    }

    if (allowedRoles && (!role || !allowedRoles.includes(role))) {
      router.replace("/");
      setIsAuthorized(false);
      return;
    }

    setIsAuthorized(true);
  }, [isLoading, isAuthenticated, role, allowedRoles]);

  return { isAuthorized, isLoading };
};
