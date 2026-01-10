import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { classService } from "../../../services/admin";
import { useInstitutionId } from "../../../utils/useInstitutionId";

export default function CreateClass() {
  const institutionId = useInstitutionId();
  const router = useRouter();

  const [year, setYear] = useState("");
  const [division, setDivision] = useState("");

  const submit = async () => {
    if (!institutionId) return;

    await classService.create({
      year: Number(year),
      division,
      institution: institutionId,
    });

    // router.replace("/(admin)/classes");
  };

  return (
    <View className="screen">
      <Text className="title">Create Class</Text>
      <TextInput className="input" placeholder="Year" keyboardType="numeric"
        onChangeText={setYear} />
      <TextInput className="input" placeholder="Division" onChangeText={setDivision} />
      <TouchableOpacity className="btn-primary" onPress={submit}>
        <Text className="btn-text">Create</Text>
      </TouchableOpacity>
    </View>
  );
}
