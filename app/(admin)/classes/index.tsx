import { ClassDirectory } from "@/components/directory/ClassDirectory";
import { useRouter } from "expo-router";
import React from "react";

export default function ClassesIndex() {
  const router = useRouter();

  return (
    <ClassDirectory
      showAddButton={true}
      onItemPress={(id) => router.push(`/(admin)/classes/${id}`)}
    />
  );
}
