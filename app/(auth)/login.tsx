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
  View
} from "react-native";
import { useAuth } from "../../store/hooks/useAuth";
import { useTheme } from "../../store/hooks/useTheme";

const Login = () => {
  const { login, isLoading, error } = useAuth();
  const { isDark } = useTheme();
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background dark:bg-dark-background"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-center px-6">

          {/* App Name */}
          <Text className="text-3xl font-bold text-center text-primary dark:text-dark-primary mb-2">
            Teachora
          </Text>

          <Text className="text-base text-center text-textSecondary dark:text-dark-textSecondary mb-8">
            Secure login to continue
          </Text>

          {/* Email */}
          <TextInput
            className="bg-card dark:bg-dark-card border border-border dark:border-dark-border rounded-xl px-4 py-4 mb-4 text-textPrimary dark:text-dark-textPrimary"
            placeholder="Email"
            placeholderTextColor={isDark ? "#9CA3AF" : "#94A3B8"}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={(text) => { setEmail(text); setLocalError(""); }}
          />

          {/* Password */}
          <View className="relative mb-3">
            <TextInput
              className="bg-card dark:bg-dark-card border border-border dark:border-dark-border rounded-xl px-4 py-4 text-textPrimary dark:text-dark-textPrimary pr-12"
              placeholder="Password"
              placeholderTextColor={isDark ? "#9CA3AF" : "#94A3B8"}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(text) => { setPassword(text); setLocalError(""); }}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4"
              testID="toggle-password"
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color={isDark ? "#9CA3AF" : "#94A3B8"}
              />
            </TouchableOpacity>
          </View>

          {/* Error */}
          {displayError ? (
            <Text className="text-error text-center mb-3">
              {displayError}
            </Text>
          ) : null}

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            className="bg-primary dark:bg-dark-primary rounded-xl py-4 items-center mt-2"
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Login
              </Text>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <Text className="text-sm text-center text-muted dark:text-dark-muted mt-6">
            © Teachora · Secure Academic Platform
          </Text>

        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Login;
