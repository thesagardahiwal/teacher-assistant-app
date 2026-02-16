import { Query } from "react-native-appwrite";
import { TeacherAssignment, TeacherAssignmentPayload } from "../types";
import { COLLECTIONS } from "./appwrite/collections";
import { databaseService } from "./appwrite/database.service";

export const assignmentService = {
  list(institutionId: string) {
    return databaseService.list<TeacherAssignment>(
      COLLECTIONS.TEACHER_ASSIGNMENTS,
      [
        Query.equal("institution", institutionId),
        Query.select(["*", "teacher.*", "subject.*", "class.*", "institution.*"])
      ]
    );
  },

  listByTeacher(institutionId: string, teacherId: string) {
    return databaseService.list<TeacherAssignment>(
      COLLECTIONS.TEACHER_ASSIGNMENTS,
      [
        Query.equal("institution", institutionId),
        Query.equal("teacher", teacherId),
        Query.select(["*", "teacher.*", "subject.*", "class.*", "institution.*"])
      ]
    );
  },

  listByClass(institutionId: string, classId: string) {
    return databaseService.list<TeacherAssignment>(
      COLLECTIONS.TEACHER_ASSIGNMENTS,
      [
        Query.equal("institution", institutionId),
        Query.equal("class", classId),
        Query.select(["*", "teacher.*", "subject.*", "class.*", "institution.*"])
      ]
    );
  },

  get(id: string) {
    return databaseService.get<TeacherAssignment>(
      COLLECTIONS.TEACHER_ASSIGNMENTS,
      id
    );
  },

  // ... existing imports

  async create(data: Partial<TeacherAssignmentPayload>) {
    // Check for duplicates: Same Class + Same Subject + Same Teacher
    if (data.class && data.subject && data.teacher && data.institution) {
      const existing = await databaseService.list<TeacherAssignment>(
        COLLECTIONS.TEACHER_ASSIGNMENTS,
        [
          Query.equal("institution", data.institution),
          Query.equal("class", data.class),
          Query.equal("subject", data.subject),
          Query.equal("teacher", data.teacher),
        ]
      );

      if (existing.documents.length > 0) {
        throw new Error("This teacher is already assigned to this subject for this class.");
      }
    }

    return databaseService.create<TeacherAssignment>(
      COLLECTIONS.TEACHER_ASSIGNMENTS,
      data
    );
  },

  update(id: string, data: Partial<TeacherAssignmentPayload>) {
    return databaseService.update<TeacherAssignment>(
      COLLECTIONS.TEACHER_ASSIGNMENTS,
      id,
      data as any
    );
  },

  delete(id: string) {
    return databaseService.delete(
      COLLECTIONS.TEACHER_ASSIGNMENTS,
      id
    );
  },
};
