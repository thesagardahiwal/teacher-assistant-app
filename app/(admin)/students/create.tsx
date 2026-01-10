import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useInstitutionId } from "../../../utils/useInstitutionId";

export default function CreateStudent() {
  const institutionId = useInstitutionId();
  const router = useRouter();

  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");

  const submit = async () => {
    if (!institutionId) return;

    // await studentService.create({
    //   name,
    //   rollNumber: roll,
    //   institution: institutionId,
    // });

    // router.replace("/(admin)/students");
  };

  return (
    <View className="screen">
      <Text className="title">Add Student</Text>
      <TextInput className="input" placeholder="Name" onChangeText={setName} />
      <TextInput className="input" placeholder="Roll Number" onChangeText={setRoll} />
      <TouchableOpacity className="btn-primary" onPress={submit}>
        <Text className="btn-text">Create</Text>
      </TouchableOpacity>
    </View>
  );
}
