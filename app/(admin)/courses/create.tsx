import CustomButton from "@/components/ui/CustomButton";
import CustomTextInput from "@/components/ui/CustomTextInput";
import { useAuth } from "@/store/hooks/useAuth";
import { useCourses } from "@/store/hooks/useCourses";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

export default function CreateCourse() {
  const router = useRouter();
  const { user } = useAuth();
  const { createCourse, loading, error } = useCourses()
  const [name, setName] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [durationYears, setDurationYears] = useState<number>(3);

  const submit = async () => {
    const institutionId = user?.institution.$id;
    console.log("Submitting form...");
    console.log({ institutionId, name, code, durationYears });
    if (!institutionId || !name || !code) return;
    console.log("FIRED!")
    await createCourse({
      name,
      code,
      durationYears,
      institution: institutionId,
      isActive: true,
    });

    router.replace("/(admin)/courses");
  };

  return (
    <View className="flex-1 bg-background dark:bg-dark-background px-6 justify-center">
      <Text className="text-xl text-primary dark:text-dark-primary font-bold mb-6">Create Course</Text>
      <CustomTextInput
        placeholder="Course Name"
        value={name}
        onChangeText={setName}
      />

      <CustomTextInput
        placeholder="Course Code"
        value={code}
        onChangeText={setCode}
      />
      <CustomTextInput
        placeholder="Duration (Years)"
        value={durationYears.toString()}
        onChangeText={(text) => setDurationYears(Number(text))}
       />

      <CustomButton title="Create" onPress={submit} isLoading={loading} />
    </View>
  );
}
