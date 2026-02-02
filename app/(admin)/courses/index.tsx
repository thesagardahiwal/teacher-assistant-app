import { CourseDirectory } from "@/components/directory/CourseDirectory";
import { useRouter } from "expo-router";
import React from "react";

export default function CoursesIndex() {
  const router = useRouter();

  return (
    <CourseDirectory
      showAddButton={true}
      onItemPress={(id) => router.push(`/(admin)/courses/${id}`)}
    />
  );
}