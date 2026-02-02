import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

const ForgotPassword = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async () => {
    setError("");
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    // Simulate API call for now since we don't have the explicit service method yet
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1500);
  };

  const content = (
    <View className="flex-1 justify-center px-6">
      <Animated.View
        entering={FadeInDown.delay(100).springify()}
        className="w-full max-w-sm md:max-w-md self-center"
      >
        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-16 h-16 rounded-2xl bg-secondary/10 dark:bg-dark-secondary/10 items-center justify-center mb-4">
            <Ionicons name="key" size={32} color={isDark ? "#818CF8" : "#4F46E5"} />
          </View>
          <Text className="text-3xl font-bold text-center text-textPrimary dark:text-dark-textPrimary">
            Forgot Password?
          </Text>
          <Text className="text-base text-center text-textSecondary dark:text-dark-textSecondary mt-2">
            No worries, we'll send you reset instructions.
          </Text>
        </View>

        {isSent ? (
          <Animated.View entering={FadeInUp} className="items-center gap-6">
            <View className="bg-success/10 p-4 rounded-full">
              <Ionicons name="checkmark-circle" size={48} color="#16A34A" />
            </View>
            <Text className="text-center text-textPrimary dark:text-dark-textPrimary text-lg font-medium">
              Check your email for instructions to reset your password.
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-transparent border border-border dark:border-dark-border rounded-xl py-4 items-center w-full mt-4"
            >
              <Text className="text-textPrimary dark:text-dark-textPrimary font-semibold text-lg">Back to Login</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View className="gap-4">
            <View>
              <Text className="text-sm font-medium text-textSecondary dark:text-dark-textSecondary mb-1.5 ml-1">Email</Text>
              <TextInput
                className="bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded-xl px-4 py-3.5 text-textPrimary dark:text-dark-textPrimary text-base"
                placeholder="Enter your email"
                value={email}
                placeholderTextColor={isDark ? "#9CA3AF" : "#94A3B8"}
                onChangeText={(v) => { setEmail(v); setError(""); }}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {error ? (
              <Animated.View entering={FadeInUp} className="bg-error/10 border border-error/20 p-3 rounded-lg">
                <Text className="text-error text-center text-sm font-medium">{error}</Text>
              </Animated.View>
            ) : null}

            <TouchableOpacity
              onPress={handleReset}
              disabled={isLoading}
              activeOpacity={0.9}
              className="bg-primary dark:bg-dark-primary rounded-xl py-4 items-center shadow-sm shadow-primary/20 mt-2"
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-bold text-lg">
                  Send Reset Link
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-transparent py-4 items-center mt-2"
            >
              <Text className="text-textSecondary dark:text-dark-textSecondary font-semibold text-base">
                <Ionicons name="arrow-back" size={16} /> Back to Login
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
}

export default ForgotPassword