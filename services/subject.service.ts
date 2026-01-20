import { Query } from "react-native-appwrite";
import { Subject, SubjectPayload } from "../types";
import { COLLECTIONS } from "./appwrite/collections";
import { databaseService } from "./appwrite/database.service";

export const subjectService = {
  list(institutionId: string) {
    return databaseService.list<Subject>(
      COLLECTIONS.SUBJECTS,
      [
        Query.equal("institution", institutionId),
        Query.select(["*", "course.*", "institution.*"])
      ]
    );
  },

  listByTeacher(institutionId: string, teacherId: string) {
    return databaseService.list<any>(
      COLLECTIONS.TEACHER_ASSIGNMENTS,
      [
        Query.equal("institution", institutionId),
        Query.equal("teacher", teacherId),
        Query.select(["subject.*"])
      ]
    ).then(response => ({
      ...response,
      documents: response.documents.map(doc => doc.subject).filter((s, i, a) => a.findIndex(t => t.$id === s.$id) === i)
    }));
  },

  get(subjectId: string) {
    return databaseService.get<Subject>(
      COLLECTIONS.SUBJECTS,
      subjectId
    );
  },

  create(data: Partial<SubjectPayload>) {
    return databaseService.create<Subject>(
      COLLECTIONS.SUBJECTS,
      data
    );
  },

  update(subjectId: string, data: Partial<SubjectPayload>) {
    return databaseService.update<Subject>(
      COLLECTIONS.SUBJECTS,
      subjectId,
      data as any
    );
  },

  delete(subjectId: string) {
    return databaseService.delete(
      COLLECTIONS.SUBJECTS,
      subjectId
    );
  },
};
