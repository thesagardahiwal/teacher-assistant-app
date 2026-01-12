import { Query } from "react-native-appwrite";
import { AttendanceRecord } from "../types";
import { COLLECTIONS } from "./appwrite/collections";
import { databaseService } from "./appwrite/database.service";

export const attendanceRecordService = {
    list(institutionId: string, queries: string[] = []) {
        return databaseService.list<AttendanceRecord>(
            COLLECTIONS.ATTENDANCE_RECORDS,
            [
                Query.equal("institution", institutionId),
                Query.select(["*", "attendance.*", "student.*", "institution.*"]),
                ...queries
            ]
        );
    },

    listByAttendance(attendanceId: string) {
        return databaseService.list<AttendanceRecord>(
            COLLECTIONS.ATTENDANCE_RECORDS,
            [
                Query.equal("attendance", attendanceId),
                Query.select(["*", "attendance.*", "student.*", "institution.*"])
            ]
        );
    },

    create(data: Omit<AttendanceRecord, keyof AttendanceRecord | "$id"> & Partial<AttendanceRecord>) {
        return databaseService.create<AttendanceRecord>(
            COLLECTIONS.ATTENDANCE_RECORDS,
            data
        );
    },

    update(recordId: string, data: Partial<AttendanceRecord>) {
        return databaseService.update<AttendanceRecord>(
            COLLECTIONS.ATTENDANCE_RECORDS,
            recordId,
            data
        );
    },

    delete(recordId: string) {
        return databaseService.delete(
            COLLECTIONS.ATTENDANCE_RECORDS,
            recordId
        );
    },
};
