import { Query } from "react-native-appwrite";
import { Class, ClassPayload } from "../types";
import { COLLECTIONS } from "./appwrite/collections";
import { databaseService } from "./appwrite/database.service";

export const classService = {
  list(institutionId: string) {
    return databaseService.list<Class>(
      COLLECTIONS.CLASSES,
      [
        Query.equal("institution", institutionId),
        Query.select(["*", "course.*", "academicYear.*", "institution.*"])
      ]
    );
  },

  listByTeacher(institutionId: string, teacherId: string) {
    return databaseService.list<any>(
      COLLECTIONS.TEACHER_ASSIGNMENTS,
      [
        Query.equal("institution", institutionId),
        Query.equal("teacher", teacherId),
        Query.select(["class.*"])
      ]
    ).then(response => ({
      ...response,
      documents: response.documents.map(doc => doc.class).filter((c, i, a) => a.findIndex(t => t.$id === c.$id) === i)
    }));
  },

  listByAcademicYear(institutionId: string, academicYearId: string) {
    return databaseService.list<Class>(
      COLLECTIONS.CLASSES,
      [
        Query.equal("institution", institutionId),
        Query.equal("academicYear", academicYearId),
        Query.select(["*", "course.*", "academicYear.*", "institution.*"])
      ]
    );
  },

  get(id: string) {
    return databaseService.get<Class>(
      COLLECTIONS.CLASSES,
      id,
      [Query.select(["*", "course.*", "academicYear.*", "institution.*"])]
    );
  },

  create(data: Partial<ClassPayload>) {
    return databaseService.create<Class>(
      COLLECTIONS.CLASSES,
      data
    );
  },

  update(classId: string, data: Partial<ClassPayload>) {
    return databaseService.update<Class>(
      COLLECTIONS.CLASSES,
      classId,
      data as any
    );
  },

  delete(classId: string) {
    return databaseService.delete(
      COLLECTIONS.CLASSES,
      classId
    );
  },
};
