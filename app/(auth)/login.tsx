import { Link } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../store/hooks/useAuth";

const Login = () => {
  const { login, isLoading, error } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email || !password) return;
    login(email.trim(), password);
  };

  return (
    <View className="flex-1 bg-background dark:bg-dark-background justify-center px-6">
      
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
        placeholderTextColor="#94A3B8"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      {/* Password */}
      <TextInput
        className="bg-card dark:bg-dark-card border border-border dark:border-dark-border rounded-xl px-4 py-4 mb-3 text-textPrimary dark:text-dark-textPrimary"
        placeholder="Password"
        placeholderTextColor="#94A3B8"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Error */}
      {error && (
        <Text className="text-error text-center mb-3">
          {error}
        </Text>
      )}

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

      <Link href="/(auth)/signup" className="text-center text-muted dark:text-dark-muted mt-6">
        Don’t have an account? <Text className="text-primary dark:text-dark-primary font-semibold">Sign Up</Text>
      </Link>

      {/* Footer */}
      <Text className="text-sm text-center text-muted dark:text-dark-muted mt-6">
        © Teachora · Secure Academic Platform
      </Text>

    </View>
  );
};

export default Login;
