import { Query } from "react-native-appwrite";
import { Student, StudentPayload } from "../../types";
import { COLLECTIONS } from "../appwrite/collections";
import { databaseService } from "../appwrite/database.service";

export const studentService = {
  list(institutionId: string) {
    return databaseService.list<Student>(
      COLLECTIONS.STUDENTS,
      [Query.equal("institution", institutionId)]
    );
  },

  create(data: Partial<StudentPayload>) {
    return databaseService.create<Student>(
      COLLECTIONS.STUDENTS,
      data
    );
  },

  update(studentId: string, data: Partial<Student>) {
    return databaseService.update<Student>(
      COLLECTIONS.STUDENTS,
      studentId,
      data
    );
  },

  delete(studentId: string) {
    return databaseService.delete(
      COLLECTIONS.STUDENTS,
      studentId
    );
  },
};
