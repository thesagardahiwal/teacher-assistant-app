import { Link, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../store/hooks/useAuth";

export default function Index() {
  const { isAuthenticated, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !isLoading && role) {
      if (role === "PRINCIPAL" || role === "VICE_PRINCIPAL") {
        router.replace("/(principal)/dashboard");
      } else if (role === "ADMIN") {
        router.replace("/(admin)/dashboard");
      } else if (role === "TEACHER") {
        router.replace("/(teacher)");
      } else if (role === "STUDENT") {
        router.replace("/(student)/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, role, router]);

  if (isLoading || isAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-dark-background">
        <ActivityIndicator size="large" className="text-primary" />
        <Text className="mt-4 text-textSecondary dark:text-dark-textSecondary font-medium">Redirecting...</Text>
      </View>
    );
  }

  // If not authenticated, show Landing Page
  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-full max-w-md md:max-w-xl items-center">
          <View className="items-center mb-10">
            <Text className="text-4xl font-bold text-primary dark:text-dark-primary mb-2">
              Teachora
            </Text>
            <Text className="text-lg text-textSecondary dark:text-dark-textSecondary text-center">
              Empowering Education for Everyone
            </Text>
          </View>

          <View className="w-full gap-4 flex-col md:flex-row">
            <Link href={{ pathname: "/(auth)/login", params: { type: "student" } }} asChild>
              <TouchableOpacity className="bg-primary dark:bg-dark-primary p-4 rounded-xl items-center w-full md:flex-1 shadow-sm">
                <Text className="text-white text-lg font-semibold">Continue as Student</Text>
              </TouchableOpacity>
            </Link>
            <Link href={{ pathname: "/(auth)/login", params: { type: "teacher" } }} asChild>
              <TouchableOpacity className="bg-card dark:bg-dark-card border border-border dark:border-dark-border p-4 rounded-xl items-center w-full md:flex-1 shadow-sm">
                <Text className="text-textPrimary dark:text-dark-textPrimary text-lg font-semibold">Continue as Teacher</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <Text className="text-sm text-center text-muted dark:text-dark-muted mt-10">
            © 2024 Teachora · Secure Academic Platform
          </Text>
        </View>
      </View>
    </View>
  );
}
