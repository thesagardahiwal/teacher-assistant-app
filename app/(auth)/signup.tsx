import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { useAuth } from "../../store/hooks/useAuth";
import { useTheme } from "../../store/hooks/useTheme";

const Signup = () => {
  const { signUp, isLoading, error } = useAuth();
  const { isDark } = useTheme();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    institutionId: "", // later from dropdown
  });
  const [showPassword, setShowPassword] = useState(false);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background dark:bg-dark-background"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-center px-6">
          <Text className="text-3xl font-bold text-center text-primary mb-6">
            Create Account
          </Text>

          <TextInput
            placeholder="Full Name"
            className="bg-card dark:bg-dark-card border border-border dark:border-dark-border rounded-xl px-4 py-4 mb-4 text-textPrimary dark:text-dark-textPrimary"
            value={form.name}
            placeholderTextColor={isDark ? "#9CA3AF" : "#94A3B8"}
            onChangeText={(v) => setForm({ ...form, name: v })}
          />

          <TextInput
            placeholder="Email"
            className="bg-card dark:bg-dark-card border border-border dark:border-dark-border rounded-xl px-4 py-4 mb-4 text-textPrimary dark:text-dark-textPrimary"
            value={form.email}
            placeholderTextColor={isDark ? "#9CA3AF" : "#94A3B8"}
            onChangeText={(v) => setForm({ ...form, email: v })}
          />

          <View className="relative mb-4">
            <TextInput
              placeholder="Password"
              secureTextEntry={!showPassword}
              className="bg-card dark:bg-dark-card border border-border dark:border-dark-border rounded-xl px-4 py-4 text-textPrimary dark:text-dark-textPrimary pr-12"
              value={form.password}
              placeholderTextColor={isDark ? "#9CA3AF" : "#94A3B8"}
              onChangeText={(v) => setForm({ ...form, password: v })}
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

          {/* Institution selection will be dropdown later */}

          {error && <Text className="text-error text-center">{error}</Text>}

          <TouchableOpacity
            onPress={() =>
              signUp({
                ...form,
                role: "ADMIN", // default for MVP
              })
            }
            className="bg-primary rounded-xl py-4 items-center mt-4"
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white">Sign Up</Text>}
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Signup;
