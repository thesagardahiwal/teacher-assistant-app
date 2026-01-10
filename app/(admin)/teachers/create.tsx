import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { authService } from "../../../services/appwrite/auth.service";
import { useInstitutionId } from "../../../utils/useInstitutionId";

export default function CreateTeacher() {
  const institutionId = useInstitutionId();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const submit = async () => {
    if (!institutionId) return;

    await authService.signUp({
      name,
      email,
      password: "Teachora@123",
      role: "TEACHER",
      institutionId,
    });

    // router.replace("/(admin)/teachers");
  };

  return (
    <View className="screen">
      <Text className="title">Add Teacher</Text>
      <TextInput className="input" placeholder="Full Name" onChangeText={setName} />
      <TextInput className="input" placeholder="Email" onChangeText={setEmail} />
      <TouchableOpacity className="btn-primary" onPress={submit}>
        <Text className="btn-text">Create</Text>
      </TouchableOpacity>
    </View>
  );
}
