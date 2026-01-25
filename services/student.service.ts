import { ID, Query } from "react-native-appwrite";
import { Student, StudentPayload } from "../types";
import { COLLECTIONS } from "./appwrite/collections";
import { databaseService } from "./appwrite/database.service";
import { invitationService } from "./invitation.service";

export const studentService = {
  async list(institutionId: string) {
    return await databaseService.list<Student>(
      COLLECTIONS.STUDENTS,
      [
        Query.equal("institution", institutionId),
        Query.select(["*", "course.*", "class.*", "institution.*"])
      ]
    );
  },

  async getByUserId(userId: string) {
    const response = await databaseService.list<Student>(
      COLLECTIONS.STUDENTS,
      [
        Query.equal("userId", userId),
        Query.limit(1),
        Query.select([
          "*",
          "course.*",
          "class.*",
          "institution.*"
        ])
      ]
    );
    return response.documents[0] || null;
  },

  async listByClasses(institutionId: string, classIds: string[]) {
    if (classIds.length === 0) return { documents: [], total: 0 };
    return await databaseService.list<Student>(
      COLLECTIONS.STUDENTS,
      [
        Query.equal("institution", institutionId),
        Query.equal("class", classIds),
        Query.select(["*", "course.*", "class.*", "institution.*"])
      ]
    );
  },

  async get(studentId: string) {
    return await databaseService.get<Student>(
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

  async create(data: Omit<StudentPayload, 'userId' | 'isActive' | 'currentYear'> & { isActive?: boolean; currentYear?: number }) {
    // 1. Create Invitation
    const userId = ID.unique();
    const invitation = await invitationService.createInvite({
      email: data.email,
      institution: data.institution,
      role: "STUDENT",
      course: data.course,
      class: data.class,
      createdBy: "ADMIN",
      userId,
    });

    // 2. Create Student Document
    // This allows us to link it later when user registers
    const student = await databaseService.createUserDocument<Student>(
      COLLECTIONS.STUDENTS,
      userId,
      {
        ...data,
        userId,
        isActive: data.isActive ?? false, // Inactive until accepted
        currentYear: data.currentYear ?? 1,
      },
    );

    return { student, invitation };
  },

  async update(studentId: string, data: Partial<StudentPayload>) {
    return await databaseService.update<Student>(
      COLLECTIONS.STUDENTS,
      studentId,
      data as any
    );
  },

  async delete(studentId: string) {
    return await databaseService.delete(
      COLLECTIONS.STUDENTS,
      studentId
    );
  },
};
