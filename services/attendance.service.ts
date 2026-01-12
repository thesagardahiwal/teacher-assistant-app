import { Query } from "react-native-appwrite";
import { Attendance } from "../types";
import { COLLECTIONS } from "./appwrite/collections";
import { databaseService } from "./appwrite/database.service";

export const attendanceService = {
    list(institutionId: string, queries: string[] = []) {
        return databaseService.list<Attendance>(
            COLLECTIONS.ATTENDANCE,
            [
                Query.equal("institution", institutionId),
                Query.select(["*", "class.*", "subject.*", "teacher.*", "institution.*"]),
                ...queries
            ]
        );
    },

    get(attendanceId: string) {
        return databaseService.get<Attendance>(
            COLLECTIONS.ATTENDANCE,
            attendanceId
        );
    },

    create(data: Omit<Attendance, keyof Attendance | "$id"> & Partial<Attendance>) {
        return databaseService.create<Attendance>(
            COLLECTIONS.ATTENDANCE,
            data
        );
    },

    update(attendanceId: string, data: Partial<Attendance>) {
        return databaseService.update<Attendance>(
            COLLECTIONS.ATTENDANCE,
            attendanceId,
            data
        );
    },

    delete(attendanceId: string) {
        return databaseService.delete(
            COLLECTIONS.ATTENDANCE,
            attendanceId
        );
    },
};
