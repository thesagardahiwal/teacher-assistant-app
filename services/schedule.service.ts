import { ClassSchedule, ClassSchedulePayload } from "@/types/schedule.type";
import { Query } from "react-native-appwrite";
import { COLLECTIONS } from "./appwrite/collections";
import { databaseService } from "./appwrite/database.service";


export const scheduleService = {
    /* ---------------- CREATE ---------------- */

    create(data: Omit<ClassSchedulePayload, "$id">) {
        return databaseService.create<ClassSchedule>(
            COLLECTIONS.CLASS_SCHEDULE,
            data
        );
    },
    /* ---------------- GET ---------------- */

    get(id: string) {
        return databaseService.get<ClassSchedule>(
            COLLECTIONS.CLASS_SCHEDULE,
            id
        );
    },

    /* ---------------- LIST ---------------- */

    listByInstitution(institutionId: string) {
        return databaseService.list<ClassSchedule>(
            COLLECTIONS.CLASS_SCHEDULE,
            [Query.equal("institution", institutionId), Query.select([
                "*",
                "class.*",
                "teacher.*",
                "subject.*",
                "academicYear.*",
                "institution.*"
            ])]
        );
    },

    listByClass(classeId: string, dayOfWeek?: string) {
        const queries = [
            Query.equal("class", classeId),
            Query.equal("isActive", true),
            Query.select([
                "*",
                "class.*",
                "teacher.*",
                "subject.*",
                "academicYear.*",
                "institution.*"
            ])
        ];

        if (dayOfWeek) {
            queries.push(Query.equal("dayOfWeek", dayOfWeek));
        }

        return databaseService.list<ClassSchedule>(
            COLLECTIONS.CLASS_SCHEDULE,
            queries
        );
    },

    listByTeacher(teacherId: string, dayOfWeek?: string) {
        const queries = [
            Query.equal("teacher", teacherId),
            Query.equal("isActive", true),
        ];

        if (dayOfWeek) {
            queries.push(Query.equal("dayOfWeek", dayOfWeek), Query.select([
                "*",
                "class.*",
                "teacher.*",
                "subject.*",
                "academicYear.*",
                "institution.*"
            ]));
        }

        return databaseService.list<ClassSchedule>(
            COLLECTIONS.CLASS_SCHEDULE,
            queries,
        );
    },

    /* ---------------- NEXT CLASS ---------------- */

    getNextClassForClass(
        classeId: string,
        dayOfWeek: string,
        currentTime: string
    ) {
        return databaseService.list<ClassSchedule>(
            COLLECTIONS.CLASS_SCHEDULE,
            [
                Query.equal("class", classeId),
                Query.equal("dayOfWeek", dayOfWeek),
                Query.greaterThan("startTime", currentTime),
                Query.equal("isActive", true),
                Query.orderAsc("startTime"),
                Query.limit(1),
                Query.select([
                    "*",
                    "class.*",
                    "teacher.*",
                    "subject.*",
                    "academicYear.*",
                    "institution.*"
                ])
            ]
        );
    },

    getNextClassForTeacher(
        teacherId: string,
        dayOfWeek: string,
        currentTime: string
    ) {
        return databaseService.list<ClassSchedule>(
            COLLECTIONS.CLASS_SCHEDULE,
            [
                Query.equal("teacher", teacherId),
                Query.equal("dayOfWeek", dayOfWeek),
                Query.greaterThan("startTime", currentTime),
                Query.equal("isActive", true),
                Query.orderAsc("startTime"),
                Query.limit(1),
                Query.select([
                    "*",
                    "class.*",
                    "teacher.*",
                    "subject.*",
                    "academicYear.*",
                    "institution.*"
                ])
            ]
        );
    },

    /* ---------------- UPDATE ---------------- */

    update(scheduleId: string, data: Partial<ClassSchedulePayload>) {
        return databaseService.update<ClassSchedule>(
            COLLECTIONS.CLASS_SCHEDULE,
            scheduleId,
            data as any
        );
    },

    /* ---------------- DELETE (SOFT) ---------------- */

    deactivate(scheduleId: string) {
        return databaseService.update<ClassSchedule>(
            COLLECTIONS.CLASS_SCHEDULE,
            scheduleId,
            { isActive: false }
        );
    },
};
