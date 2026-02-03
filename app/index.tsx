import WebLanding from "@/components/web/WebLanding";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Image, Platform, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useAuth } from "../store/hooks/useAuth";

export default function Index() {
  const { isAuthenticated, role, isLoading } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const logoSource = isDark
    ? require("../assets/images/DarkMode.png")
    : require("../assets/images/LightMode.png");

  useEffect(() => {
    if (isAuthenticated && !isLoading && role) {
      if (role === "PRINCIPAL" || role === "VICE_PRINCIPAL" || role === "TEACHER") {
        router.replace("/(teacher)");
      } else if (role === "ADMIN") {
        router.replace("/(admin)/dashboard");
      } else if (role === "STUDENT") {
        router.replace("/(student)/dashboard");
      };
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

  if (Platform.OS === "web") {
    return <WebLanding />
  }
  // If not authenticated, show Landing Page
  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <View className="flex-1 items-center px-6 justify-center gap-12 py-10">

        {/* Header Section */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          className="items-center"
        >
          <View className="p-4 mb-6">
            <Image
              source={logoSource}
              className="w-32 h-32"
              resizeMode="contain"
            />
          </View>
          <Text className="text-4xl font-extrabold text-textPrimary dark:text-dark-textPrimary tracking-tight text-center">
            Teachora
          </Text>
          <Text className="text-lg text-textSecondary dark:text-dark-textSecondary text-center mt-2 font-medium">
            Empowering Education for Everyone
          </Text>
        </Animated.View>

        {/* Role Selection Section */}
        <View className="w-full gap-6">
          <Link href={{ pathname: "/(auth)/login", params: { type: "student" } }} asChild>
            <TouchableOpacity activeOpacity={0.9}>
              <Animated.View
                entering={FadeInUp.delay(300).springify()}
                className="bg-white dark:bg-dark-card border-2 border-primary/30 dark:border-dark-primary/50 p-5 rounded-2xl flex-row items-center gap-4 shadow-sm"
              >
                <View className="w-14 h-14 rounded-full bg-primary/10 dark:bg-dark-primary/10 items-center justify-center">
                  <Ionicons name="school" size={28} color={isDark ? "#4C8DFF" : "#1A73E8"} />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-textPrimary dark:text-dark-textPrimary">
                    Student
                  </Text>
                  <Text className="text-sm text-textSecondary dark:text-dark-textSecondary">
                    Login to view updates & results
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={isDark ? "#9CA3AF" : "#94A3B8"} />
              </Animated.View>
            </TouchableOpacity>
          </Link>

          <Link href={{ pathname: "/(auth)/login", params: { type: "teacher" } }} asChild>
            <TouchableOpacity activeOpacity={0.9}>
              <Animated.View
                entering={FadeInUp.delay(400).springify()}
                className="bg-white dark:bg-dark-card border-2 border-secondary/30 dark:border-dark-secondary/50 p-5 rounded-2xl flex-row items-center gap-4 shadow-sm"
              >
                <View className="w-14 h-14 rounded-full bg-secondary/10 dark:bg-dark-secondary/10 items-center justify-center">
                  <Ionicons name="easel" size={28} color={isDark ? "#818CF8" : "#4F46E5"} />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-textPrimary dark:text-dark-textPrimary">
                    Teacher
                  </Text>
                  <Text className="text-sm text-textSecondary dark:text-dark-textSecondary">
                    Login to manage classrooms
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={isDark ? "#9CA3AF" : "#94A3B8"} />
              </Animated.View>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Footer */}
        <Animated.View entering={FadeInUp.delay(700).springify()}>
          <Text className="text-xs text-center text-muted dark:text-dark-muted">
            By continuing, you agree to our Terms of Service & Privacy Policy
          </Text>
          <Text className="text-xs text-center text-muted dark:text-dark-muted mt-2">
            © 2024 Teachora
          </Text>
        </Animated.View>

      </View>
    </View>
  );
}
