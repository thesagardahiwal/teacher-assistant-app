import { Query } from "react-native-appwrite";
import { Class, ClassPayload } from "../../types";
import { COLLECTIONS } from "../appwrite/collections";
import { databaseService } from "../appwrite/database.service";

export const classService = {
  list(institutionId: string) {
    return databaseService.list<Class>(
      COLLECTIONS.CLASSES,
      [Query.equal("institution", institutionId)]
    );
  },

  create(data: Partial<ClassPayload>) {
    return databaseService.create<Class>(
      COLLECTIONS.CLASSES,
      data
    );
  },

  update(classId: string, data: Partial<Class>) {
    return databaseService.update<Class>(
      COLLECTIONS.CLASSES,
      classId,
      data
    );
  },

  delete(classId: string) {
    return databaseService.delete(
      COLLECTIONS.CLASSES,
      classId
    );
  },
};
