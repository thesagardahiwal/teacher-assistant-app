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

    listByStudent(studentId: string) {
        return databaseService.list<AttendanceRecord>(
            COLLECTIONS.ATTENDANCE_RECORDS,
            [
                Query.equal("student", studentId),
                Query.select(["*", "attendance.*", "attendance.subject.*", "student.*", "institution.*"]),
                Query.orderDesc("$createdAt"), // Show recent first
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

    async getSubjectAttendanceStats(institutionId: string, studentId: string, subjectId: string) {
        // 1. Get all attendance sessions for this subject
        // varying limit based on expected number of sessions per term/year
        const attendanceSessions = await databaseService.list<AttendanceRecord>(
            COLLECTIONS.ATTENDANCE,
            [
                Query.equal("institution", institutionId),
                Query.equal("subject", subjectId),
                Query.select(["$id"]),
                Query.limit(1000)
            ]
        );

        const attendanceIds = attendanceSessions.documents.map(d => d.$id);

        if (attendanceIds.length === 0) {
            return { total: 0, present: 0 };
        }

        // 2. Query stats using the attendance IDs
        const totalReq = databaseService.list<AttendanceRecord>(
            COLLECTIONS.ATTENDANCE_RECORDS,
            [
                Query.equal("institution", institutionId),
                Query.equal("student", studentId),
                Query.equal("attendance", attendanceIds),
                Query.limit(1), // We only need the total count
            ]
        );

        const presentReq = databaseService.list<AttendanceRecord>(
            COLLECTIONS.ATTENDANCE_RECORDS,
            [
                Query.equal("institution", institutionId),
                Query.equal("student", studentId),
                Query.equal("attendance", attendanceIds),
                Query.equal("present", true),
                Query.limit(1), // We only need the total count
            ]
        );

        const [totalRes, presentRes] = await Promise.all([totalReq, presentReq]);

        return {
            total: totalRes.total,
            present: presentRes.total
        };
    },
};
