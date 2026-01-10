import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { subjectService } from "../../../services/admin";
import { useInstitutionId } from "../../../utils/useInstitutionId";

export default function CreateSubject() {
  const institutionId = useInstitutionId();
  const router = useRouter();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const submit = async () => {
    if (!institutionId) return;

    await subjectService.create({
      name,
      code,
      institution: institutionId
    });

    // router.replace("/(admin)/subjects");
  };

  return (
    <View className="screen">
      <Text className="title">Create Subject</Text>
      <TextInput className="input" placeholder="Subject Name" onChangeText={setName} />
      <TextInput className="input" placeholder="Subject Code" onChangeText={setCode} />
      <TouchableOpacity className="btn-primary" onPress={submit}>
        <Text className="btn-text">Create</Text>
      </TouchableOpacity>
    </View>
  );
}
