import { Link, Redirect } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../store/hooks/useAuth";

export default function Index() {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isAuthenticated && !isLoading) {
    switch (role) {
      case "PRINCIPAL":
      case "VICE_PRINCIPAL":
        return <Redirect href="/(principal)/dashboard" />;
      case "ADMIN":
        return <Redirect href="/(admin)/dashboard" />;
      case "TEACHER":
        return <Redirect href="/(teacher)" />;
      case "STUDENT":
        return <Redirect href="/(student)/dashboard" />;
      default:
        // If role matches none, stay here or go to login? 
        // Likely shouldn't happen if authenticated.
        break;
    }
  }

  // If not authenticated, show Landing Page
  return (
    <View className="flex-1 bg-background dark:bg-dark-background items-center justify-center px-6">
      <View className="items-center mb-10">
        <Text className="text-4xl font-bold text-primary dark:text-dark-primary mb-2">
          Teachora
        </Text>
        <Text className="text-lg text-textSecondary dark:text-dark-textSecondary text-center">
          Empowering Education for Everyone
        </Text>
      </View>

      <View className="w-full space-y-4 gap-4">
        <Link href={{ pathname: "/(auth)/login", params: { type: "student" } }} asChild>
          <TouchableOpacity className="bg-primary dark:bg-dark-primary p-4 rounded-xl items-center">
            <Text className="text-white text-lg font-semibold">Continue as Student</Text>
          </TouchableOpacity>
        </Link>
        <Link href={{ pathname: "/(auth)/login", params: { type: "teacher" } }} asChild>
          <TouchableOpacity className="bg-card dark:bg-dark-card border border-border dark:border-dark-border p-4 rounded-xl items-center">
            <Text className="text-textPrimary dark:text-dark-textPrimary text-lg font-semibold">Continue as Teacher</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <Text className="text-sm text-center text-muted dark:text-dark-muted mt-10">
        © 2024 Teachora · Secure Academic Platform
      </Text>
    </View>
  );
}
