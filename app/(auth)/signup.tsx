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
import { ID } from "react-native-appwrite";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { account } from "../../services/appwrite/client";
import { COLLECTIONS } from "../../services/appwrite/collections";
import { databaseService } from "../../services/appwrite/database.service";
import { institutionService } from "../../services/institution.service";
import { useAuth } from "../../store/hooks/useAuth";

const Signup = () => {
  const { login } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [instituteName, setInstituteName] = useState("");
  const [instituteCode, setInstituteCode] = useState("");

  const handleNext = () => {
    setError("");
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setError("");
    setStep(1);
  };

  const handleSignup = async () => {
    setError("");
    if (!instituteName || !instituteCode) {
      setError("Please fill in all institute fields");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create Auth Account
      const userAccount = await account.create(
        ID.unique(),
        email.trim(),
        password,
        name
      );

      // Step 2: Create Institute
      const institutionData = {
        name: instituteName.trim(),
        code: instituteCode.trim(),
        isActive: true,
      };
      // @ts-ignore
      const institution = await institutionService.create(institutionData);

      // Step 3: Create User Record (Associate with Institute + Role = ADMIN)
      await databaseService.createUserDocument(COLLECTIONS.USERS, userAccount.$id, {
        userId: userAccount.$id,
        email: email.trim(),
        name: name.trim(),
        role: "ADMIN",
        institution: institution.$id,
        isActive: true,
      });

      // Step 4: Login (Auth Service) - This will update global state via useAuth
      await login(email.trim(), password, "teacher");

      // Step 5: Redirect (Handled by Layout/Router usually, but explicit here for safety)
      router.replace("/(admin)/dashboard");

    } catch (err: any) {
      console.error("Signup Flow Error:", err);
      let msg = err.message || "An unexpected error occurred during signup.";
      if (msg.includes("already exists")) {
        msg = "Account or Institute code already exists.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <View className="flex-1 max-w-xl mx-auto w-full justify-center px-6">
      <Animated.View
        entering={FadeInDown.delay(100).springify()}
        className="w-full max-w-sm md:max-w-md self-center"
      >
        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-16 h-16 rounded-2xl bg-secondary/10 dark:bg-dark-secondary/10 items-center justify-center mb-4">
            <Ionicons name="add-circle" size={32} color={isDark ? "#818CF8" : "#4F46E5"} />
          </View>
          <Text className="text-3xl font-bold text-center text-textPrimary dark:text-dark-textPrimary">
            {step === 1 ? "Create Account" : "Institute Details"}
          </Text>
          <Text className="text-base text-center text-textSecondary dark:text-dark-textSecondary mt-2">
            {step === 1 ? "Start your journey with Teachora" : "Setup your digital institute"}
          </Text>
        </View>

        {/* Steps Indicator */}
        <View className="flex-row gap-2 mb-8 justify-center">
          <View className={`h-1.5 rounded-full flex-1 ${step >= 1 ? 'bg-primary dark:bg-dark-primary' : 'bg-border dark:bg-dark-border'}`} />
          <View className={`h-1.5 rounded-full flex-1 ${step >= 2 ? 'bg-primary dark:bg-dark-primary' : 'bg-border dark:bg-dark-border'}`} />
        </View>

        {/* Form Fields */}
        <View className="gap-4">
          {step === 1 ? (
            <>
              <View>
                <Text className="text-sm font-medium text-textSecondary dark:text-dark-textSecondary mb-1.5 ml-1">Full Name</Text>
                <TextInput
                  className="bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded-xl px-4 py-3.5 text-textPrimary dark:text-dark-textPrimary text-base"
                  placeholder="Enter your full name"
                  value={name}
                  placeholderTextColor={isDark ? "#9CA3AF" : "#94A3B8"}
                  onChangeText={(v) => { setName(v); setError(""); }}
                />
              </View>

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

              <View>
                <Text className="text-sm font-medium text-textSecondary dark:text-dark-textSecondary mb-1.5 ml-1">Password</Text>
                <View className="relative">
                  <TextInput
                    className="bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded-xl px-4 py-3.5 text-textPrimary dark:text-dark-textPrimary pr-12 text-base"
                    placeholder="Create a password"
                    secureTextEntry={!showPassword}
                    value={password}
                    placeholderTextColor={isDark ? "#9CA3AF" : "#94A3B8"}
                    onChangeText={(v) => { setPassword(v); setError(""); }}
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
            </>
          ) : (
            <>
              <View>
                <Text className="text-sm font-medium text-textSecondary dark:text-dark-textSecondary mb-1.5 ml-1">Institute Name</Text>
                <TextInput
                  className="bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded-xl px-4 py-3.5 text-textPrimary dark:text-dark-textPrimary text-base"
                  placeholder="e.g. Springfield High"
                  value={instituteName}
                  placeholderTextColor={isDark ? "#9CA3AF" : "#94A3B8"}
                  onChangeText={(v) => { setInstituteName(v); setError(""); }}
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-textSecondary dark:text-dark-textSecondary mb-1.5 ml-1">Institute Code</Text>
                <TextInput
                  className="bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded-xl px-4 py-3.5 text-textPrimary dark:text-dark-textPrimary text-base"
                  placeholder="e.g. SCH001"
                  value={instituteCode}
                  placeholderTextColor={isDark ? "#9CA3AF" : "#94A3B8"}
                  onChangeText={(v) => { setInstituteCode(v); setError(""); }}
                  autoCapitalize="characters"
                />
                <Text className="text-xs text-muted dark:text-dark-muted mt-1.5 px-1">
                  Unique code for students/teachers to join.
                </Text>
              </View>
            </>
          )}

          {/* Error Message */}
          {error ? (
            <Animated.View entering={FadeInUp} className="bg-error/10 border border-error/20 p-3 rounded-lg mt-2">
              <Text className="text-error text-center text-sm font-medium">{error}</Text>
            </Animated.View>
          ) : null}

          {/* Action Buttons */}
          <View className="mt-4 gap-3">
            {step === 1 ? (
              <TouchableOpacity
                onPress={handleNext}
                activeOpacity={0.9}
                className="bg-primary dark:bg-dark-primary rounded-xl py-4 items-center shadow-sm shadow-primary/20"
              >
                <Text className="text-white font-bold text-lg">Next Step</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  onPress={handleSignup}
                  disabled={loading}
                  activeOpacity={0.9}
                  className="bg-primary dark:bg-dark-primary rounded-xl py-4 items-center shadow-sm shadow-primary/20"
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-bold text-lg">Create Account</Text>
                  )}
                </TouchableOpacity>

                {!loading && (
                  <TouchableOpacity
                    onPress={handleBack}
                    className="bg-transparent border border-border dark:border-dark-border rounded-xl py-4 items-center"
                  >
                    <Text className="text-textPrimary dark:text-dark-textPrimary font-semibold text-lg">Back</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>

        {step === 1 && (
          <View className="flex-row justify-center mt-8 items-center gap-1">
            <Text className="text-textSecondary dark:text-dark-textSecondary text-base">
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text className="text-primary dark:text-dark-primary font-bold text-base">
                Login
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </View>
  )

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

export default Signup;
