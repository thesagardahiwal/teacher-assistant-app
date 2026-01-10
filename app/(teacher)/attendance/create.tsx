import { useAuth } from "@/store/hooks/useAuth";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { assignmentService } from "../../../services/admin";
import { useInstitutionId } from "../../../utils/useInstitutionId";

export default function CreateAssignment() {
  const institutionId = useInstitutionId();
  const router = useRouter();
  const { user } = useAuth();
  

  const submit = async () => {
    if (!institutionId || !user?.$id) return;

    await assignmentService.create({
      teacher: user.$id,
      subject: "SUBJECT_ID",
      class: "CLASS_ID",
      institution: institutionId,
    });

    // router.replace("/(admin)/assignments");
  };

  return (
    <View className="screen">
      <Text className="title">Assign Teacher</Text>
      {/* dropdowns later */}
      <TouchableOpacity className="btn-primary" onPress={submit}>
        <Text className="btn-text">Assign</Text>
      </TouchableOpacity>
    </View>
  );
}
