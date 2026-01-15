import { Query } from "react-native-appwrite";
import { Student, StudentPayload } from "../types";
import { COLLECTIONS } from "./appwrite/collections";
import { databaseService } from "./appwrite/database.service";

export const studentService = {
  list(institutionId: string) {
    return databaseService.list<Student>(
      COLLECTIONS.STUDENTS,
      [
        Query.equal("institution", institutionId),
        Query.select(["*", "course.*", "class.*", "institution.*"])
      ]
    );
  },

  listByClasses(institutionId: string, classIds: string[]) {
    if (classIds.length === 0) return Promise.resolve({ documents: [], total: 0 });
    return databaseService.list<Student>(
      COLLECTIONS.STUDENTS,
      [
        Query.equal("institution", institutionId),
        Query.equal("class", classIds),
        Query.select(["*", "course.*", "class.*", "institution.*"])
      ]
    );
  },

  get(studentId: string) {
    return databaseService.get<Student>(
      COLLECTIONS.STUDENTS,
      studentId,
      [
        Query.select([
          "*",
          "course.*",
          "class.*",
          "institution.*"
        ])
      ]
    );
  },

  create(data: Partial<StudentPayload>) {
    return databaseService.create<Student>(
      COLLECTIONS.STUDENTS,
      data
    );
  },

  update(studentId: string, data: Partial<StudentPayload>) {
    return databaseService.update<Student>(
      COLLECTIONS.STUDENTS,
      studentId,
      data as any
    );
  },

  delete(studentId: string) {
    return databaseService.delete(
      COLLECTIONS.STUDENTS,
      studentId
    );
  },
};
