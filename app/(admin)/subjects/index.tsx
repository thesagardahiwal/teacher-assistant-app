import { useEffect } from "react";
import { ScrollView, Text } from "react-native";
import { ListItem } from "../../../components/admin/ListItem";
import { useSubjects } from "../../../store/hooks/useSubjects";
import { useInstitutionId } from "../../../utils/useInstitutionId";

export default function SubjectsIndex() {
  const institutionId = useInstitutionId();
  const { data, fetchSubjects } = useSubjects();

  useEffect(() => {
    if (institutionId) fetchSubjects(institutionId);
  }, [institutionId]);

  return (
    <ScrollView className="flex-1 bg-background px-6">
      <Text className="text-xl font-bold mb-4">Subjects</Text>

      {data.map((subject) => (
        <ListItem
          key={subject.$id}
          title={subject.name}
          subtitle={subject.code}
          href={`/(admin)/subjects/${subject.$id}`}
        />
      ))}
    </ScrollView>
  );
}
