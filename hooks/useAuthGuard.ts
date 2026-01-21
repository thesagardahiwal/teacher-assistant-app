import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../store/hooks/useAuth";

export const useAuthGuard = (allowedRoles: string[] = []) => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;



    if (!isAuthenticated) {
      router.replace("/(auth)/login");
    } else if (allowedRoles.length > 0 && (!role || !allowedRoles.includes(role))) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, role, JSON.stringify(allowedRoles), router]);

  // Derived state - synchronous to avoid flickers
  // If loading, we aren't "authorized" yet in a final sense, but we shouldn't block rendering if we want to show a spinner
  // user might do: if (isLoading) return <Spinner />
  // if (!isAuthorized) return null;
  const isAuthorized = !isLoading && isAuthenticated && (!allowedRoles.length || (!!role && allowedRoles.includes(role)));

  return { isAuthorized, isLoading };
};
