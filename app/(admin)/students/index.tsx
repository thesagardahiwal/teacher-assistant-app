import { useEffect } from "react";
import { ScrollView, Text } from "react-native";
import { ListItem } from "../../../components/admin/ListItem";
import { useStudents } from "../../../store/hooks/useStudents";
import { useInstitutionId } from "../../../utils/useInstitutionId";

export default function StudentsIndex() {
  const institutionId = useInstitutionId();
  const { data, fetchStudents } = useStudents();

  useEffect(() => {
    if (institutionId) fetchStudents(institutionId);
  }, [institutionId]);

  return (
    <ScrollView className="flex-1 bg-background px-6">
      <Text className="text-xl font-bold mb-4">Students</Text>

      {data.map((student) => (
        <ListItem
          key={student.$id}
          title={student.user.name}
          subtitle={`Roll: ${student.rollNumber}`}
          href={`/(admin)/students/${student.$id}`}
        />
      ))}
    </ScrollView>
  );
}
