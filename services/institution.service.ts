import { Institution } from "../types";
import { COLLECTIONS } from "./appwrite/collections";
import { databaseService } from "./appwrite/database.service";

export const institutionService = {
    get(institutionId: string) {
        return databaseService.get<Institution>(
            COLLECTIONS.INSTITUTIONS,
            institutionId
        );
    },

    update(institutionId: string, data: Partial<Institution>) {
        return databaseService.update<Institution>(
            COLLECTIONS.INSTITUTIONS,
            institutionId,
            data
        );
    },

    create(data: Omit<Institution, keyof import("react-native-appwrite").Models.Document>) {
        return databaseService.create<Institution>(
            COLLECTIONS.INSTITUTIONS,
            data
        );
    },
};
