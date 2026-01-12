import { Query } from "react-native-appwrite";
import { User, UserPayload } from "../types/user.type";
import { COLLECTIONS } from "./appwrite/collections";
import { databaseService } from "./appwrite/database.service";

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

  get(teacherId: string) {
    return databaseService.get<User>(
      COLLECTIONS.USERS,
      teacherId
    );
  },

  update(teacherId: string, data: Partial<UserPayload>) {
    return databaseService.update<User>(
      COLLECTIONS.USERS,
      teacherId,
      data as any
    );
  },
};
