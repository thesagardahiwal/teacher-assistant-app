import { useEffect } from "react";
import { ScrollView, Text } from "react-native";
import { ListItem } from "../../../components/admin/ListItem";
import { useClasses } from "../../../store/hooks/useClasses";
import { useInstitutionId } from "../../../utils/useInstitutionId";

export default function ClassesIndex() {
  const institutionId = useInstitutionId();
  const { data, fetchClasses } = useClasses();

  useEffect(() => {
    if (institutionId) fetchClasses(institutionId);
  }, [institutionId]);

  return (
    <ScrollView className="flex-1 bg-background px-6">
      <Text className="text-xl font-bold mb-4">Classes</Text>

      {data.map((cls) => (
        <ListItem
          key={cls.$id}
          title={`Year ${cls.year} - ${cls.division}`}
          subtitle={`Semester ${cls.semester}`}
          href={`/(admin)/classes/${cls.$id}`}
        />
      ))}
    </ScrollView>
  );
}
