import { useEffect } from "react";
import { ScrollView, Text } from "react-native";
import { ListItem } from "../../../components/admin/ListItem";
import { useTeachers } from "../../../store/hooks/useTeachers";
import { useInstitutionId } from "../../../utils/useInstitutionId";

export default function TeachersIndex() {
  const institutionId = useInstitutionId();
  const { data, fetchTeachers } = useTeachers();

  useEffect(() => {
    if (institutionId) fetchTeachers(institutionId);
  }, [institutionId]);

  return (
    <ScrollView className="flex-1 bg-background px-6">
      <Text className="text-xl font-bold mb-4">Teachers</Text>

      {data.map((teacher) => (
        <ListItem
          key={teacher.$id}
          title={teacher.name}
          subtitle={teacher.email}
          href={`/(admin)/teachers/${teacher.$id}`}
        />
      ))}
    </ScrollView>
  );
}
