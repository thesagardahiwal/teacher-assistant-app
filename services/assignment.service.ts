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

  get(id: string) {
    return databaseService.get<TeacherAssignment>(
      COLLECTIONS.TEACHER_ASSIGNMENTS,
      id
    );
  },

  // ... existing imports

  create(data: Partial<TeacherAssignmentPayload>) {
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
