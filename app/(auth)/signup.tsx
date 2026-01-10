import React, { useState } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../store/hooks/useAuth";

const Signup = () => {
  const { signUp, isLoading, error } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    institutionId: "", // later from dropdown
  });

  return (
    <View className="flex-1 bg-background dark:bg-dark-background justify-center px-6">
      <Text className="text-3xl font-bold text-center text-primary mb-6">
        Create Account
      </Text>
     
      <TextInput
        placeholder="Full Name"
        className="bg-card dark:bg-dark-card border border-border dark:border-dark-border rounded-xl px-4 py-4 mb-4 text-textPrimary dark:text-dark-textPrimary"
        value={form.name}
        placeholderTextColor="#94A3B8"
        onChangeText={(v) => setForm({ ...form, name: v })}
      />

      <TextInput
        placeholder="Email"
        className="bg-card dark:bg-dark-card border border-border dark:border-dark-border rounded-xl px-4 py-4 mb-4 text-textPrimary dark:text-dark-textPrimary"
        value={form.email}
        placeholderTextColor="#94A3B8"
        onChangeText={(v) => setForm({ ...form, email: v })}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        className="bg-card dark:bg-dark-card border border-border dark:border-dark-border rounded-xl px-4 py-4 mb-4 text-textPrimary dark:text-dark-textPrimary"
        value={form.password}
        placeholderTextColor="#94A3B8"
        onChangeText={(v) => setForm({ ...form, password: v })}
      />

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
  );
};

export default Signup;
