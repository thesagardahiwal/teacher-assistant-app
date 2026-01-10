import { Query } from "react-native-appwrite";
import { Subject, SubjectPayload } from "../../types";
import { COLLECTIONS } from "../appwrite/collections";
import { databaseService } from "../appwrite/database.service";

export const subjectService = {
  list(institutionId: string) {
    return databaseService.list<Subject>(
      COLLECTIONS.SUBJECTS,
      [Query.equal("institution", institutionId)]
    );
  },

  create(data: Partial<SubjectPayload>) {
    return databaseService.create<Subject>(
      COLLECTIONS.SUBJECTS,
      data
    );
  },

  update(subjectId: string, data: Partial<Subject>) {
    return databaseService.update<Subject>(
      COLLECTIONS.SUBJECTS,
      subjectId,
      data
    );
  },

  delete(subjectId: string) {
    return databaseService.delete(
      COLLECTIONS.SUBJECTS,
      subjectId
    );
  },
};
