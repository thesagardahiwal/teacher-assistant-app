import { Query } from "react-native-appwrite";
import { User, UserPayload } from "../types/user.type";
import { COLLECTIONS } from "./appwrite/collections";
import { databaseService } from "./appwrite/database.service";

export const userService = {
    list(institutionId: string) {
        return databaseService.list<User>(
            COLLECTIONS.USERS,
            [
                Query.equal("institution", institutionId),
                Query.select(["*", "institution.*"])
            ]
        );
    },

    get(userId: string) {
        return databaseService.get<User>(
            COLLECTIONS.USERS,
            userId,
            [Query.select(["*", "institution.*"])]
        );
    },

    update(userId: string, data: Partial<UserPayload>) {
        return databaseService.update<User>(
            COLLECTIONS.USERS,
            userId,
            data as any
        );
    },

    delete(userId: string) {
        return databaseService.delete(
            COLLECTIONS.USERS,
            userId
        );
    },
};
