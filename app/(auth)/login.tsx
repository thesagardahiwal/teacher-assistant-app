import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useColorScheme
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useAuth } from "../../store/hooks/useAuth";

const Login = () => {
  const { login, isLoading, error } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { type } = useLocalSearchParams<{ type: string }>();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleLogin = async () => {
    Keyboard.dismiss();
    setLocalError("");
    if (!email || !password) {
      setLocalError("Please enter both email and password.");
      return;
    }

    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setLocalError("Please enter a valid email address.");
      return;
    }

    login(email.trim(), password, type as "student" | "teacher" | undefined);
  };

  // Map raw error to user friendly message
  const getErrorMessage = (err: string | null) => {
    if (!err) return null;
    if (err.includes("Invalid credentials") || err.includes("Invalid email or password")) {
      return "Incorrect email or password. Please try again.";
    }
    if (err.includes("Rate limit")) {
      return "Too many attempts. Please try again later.";
    }
    return err; // Fallback
  };

  const displayError = localError || getErrorMessage(error);

  const content = (
    <View className="flex-1 justify-center px-6">
      <Animated.View
        entering={FadeInDown.delay(100).springify()}
        className="w-full max-w-sm md:max-w-md self-center"
      >
        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-16 h-16 rounded-2xl bg-primary/10 dark:bg-dark-primary/10 items-center justify-center mb-4">
            <Ionicons name={type === 'teacher' ? "easel" : "school"} size={32} color={isDark ? "#4C8DFF" : "#1A73E8"} />
          </View>
          <Text className="text-3xl font-bold text-center text-textPrimary dark:text-dark-textPrimary">
            Welcome Back!
          </Text>
          <Text className="text-base text-center text-textSecondary dark:text-dark-textSecondary mt-2">
            Login to your {type === 'teacher' ? "Teacher" : "Student"} account
          </Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          {/* Email */}
          <View>
            <Text className="text-sm font-medium text-textSecondary dark:text-dark-textSecondary mb-1.5 ml-1">Email</Text>
            <TextInput
              className="bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded-xl px-4 py-3.5 text-textPrimary dark:text-dark-textPrimary text-base"
              placeholder="Enter your email"
              placeholderTextColor={isDark ? "#9CA3AF" : "#94A3B8"}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={(text) => { setEmail(text); setLocalError(""); }}
            />
          </View>

          {/* Password */}
          <View>
            <Text className="text-sm font-medium text-textSecondary dark:text-dark-textSecondary mb-1.5 ml-1">Password</Text>
            <View className="relative">
              <TextInput
                className="bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded-xl px-4 py-3.5 text-textPrimary dark:text-dark-textPrimary pr-12 text-base"
                placeholder="Enter your password"
                placeholderTextColor={isDark ? "#9CA3AF" : "#94A3B8"}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => { setPassword(text); setLocalError(""); }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5"
                testID="toggle-password"
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color={isDark ? "#9CA3AF" : "#94A3B8"}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/(auth)/forgot-password")}
            className="self-end"
          >
            <Text className="text-sm font-medium text-primary dark:text-dark-primary">
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Error */}
        {displayError ? (
          <Animated.View entering={FadeInUp} className="bg-error/10 border border-error/20 p-3 rounded-lg mt-4">
            <Text className="text-error text-center text-sm font-medium">
              {displayError}
            </Text>
          </Animated.View>
        ) : null}

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.9}
          className="bg-primary dark:bg-dark-primary rounded-xl py-4 items-center mt-6 shadow-sm shadow-primary/20"
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-bold text-lg">
              Login
            </Text>
          )}
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View className="flex-row justify-center mt-8 items-center gap-1">
          <Text className="text-textSecondary dark:text-dark-textSecondary text-base">
            Don't have an account?
          </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
            <Text className="text-primary dark:text-dark-primary font-bold text-base">
              Sign up
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background dark:bg-dark-background"
    >
      {Platform.OS === "web" ? content : (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          {content}
        </TouchableWithoutFeedback>
      )}
    </KeyboardAvoidingView>
  );
};

export default Login;
