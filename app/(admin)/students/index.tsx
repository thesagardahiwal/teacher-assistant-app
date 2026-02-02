import { StudentDirectory } from "@/components/directory/StudentDirectory";
import { useRouter } from "expo-router";
import React from "react";

export default function StudentsIndex() {
  const router = useRouter();

  return (
    <StudentDirectory
      showAddButton={true}
      onItemPress={(id) => router.push(`/(admin)/students/${id}`)}
    />
  );
}
