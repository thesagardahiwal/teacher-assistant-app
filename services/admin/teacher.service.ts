import { Query } from "react-native-appwrite";
import { User } from "../../types";
import { COLLECTIONS } from "../appwrite/collections";
import { databaseService } from "../appwrite/database.service";

export const teacherService = {
  list(institutionId: string) {
    return databaseService.list<User>(
      COLLECTIONS.USERS,
      [
        Query.equal("institution", institutionId),
        Query.equal("role", "TEACHER"),
      ]
    );
  },

  update(teacherId: string, data: Partial<User>) {
    return databaseService.update<User>(
      COLLECTIONS.USERS,
      teacherId,
      data
    );
  },
};
