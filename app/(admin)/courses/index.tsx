import { useEffect } from "react";
import { ScrollView, Text } from "react-native";
import { ListItem } from "../../../components/admin/ListItem";
import { useCourses } from "../../../store/hooks/useCourses";
import { useInstitutionId } from "../../../utils/useInstitutionId";

export default function CoursesIndex() {
  const institutionId = useInstitutionId();
  const { data, loading, fetchCourses } = useCourses();

  useEffect(() => {
    if (institutionId) fetchCourses(institutionId);
  }, [institutionId]);

  return (
    <ScrollView className="flex-1 bg-background dark:bg-dark-background px-6">
      <Text className="text-xl text-primary dark:text-dark-primary font-bold mb-4">Courses</Text>

      {loading && <Text>Loading...</Text>}
      {!loading && data.length === 0 && <Text className="text-secondary dark:text-dark-secondary">No courses found.</Text>}

      {data.map((course) => (
        <ListItem
          key={course.$id}
          title={course.name}
          subtitle={course.code}
          href={`/(admin)/courses/${course.$id}`}
        />
      ))}
    </ScrollView>
  );
}