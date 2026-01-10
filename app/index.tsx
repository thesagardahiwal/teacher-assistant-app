import { Redirect } from "expo-router";
import { useAuth } from "../store/hooks/useAuth";

export default function Index() {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  switch (role) {
    case "PRINCIPAL":
      return <Redirect href="/(principal)/dashboard" />;

    case "ADMIN":
      return <Redirect href="/(admin)/dashboard" />;

    case "TEACHER":
      return <Redirect href="/(teacher)/dashboard" />;

    case "STUDENT":
      return <Redirect href="/(student)/dashboard" />;

    default:
      return <Redirect href="/(auth)/login" />;
  }
}
