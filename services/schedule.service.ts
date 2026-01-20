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
            id,
            [Query.select([
                "*",
                "class.*",
                "teacher.*",
                "subject.*",
                "academicYear.*",
                "institution.*"
            ])]
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
    getPreviousClassForTeacher(
        teacherId: string,
        dayOfWeek: string,
        currentTime: string
    ) {
        return databaseService.list<ClassSchedule>(
            COLLECTIONS.CLASS_SCHEDULE,
            [
                Query.equal("teacher", teacherId),
                Query.equal("dayOfWeek", dayOfWeek),
                Query.lessThanEqual("startTime", currentTime), // Started in the past or now
                Query.equal("isActive", true),
                Query.orderDesc("startTime"), // Get the most recent one
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
        const payload: any = { ...data };

        // Sanitize relationship fields to ensure they are strings (IDs)
        const relationshipFields = ["class", "subject", "teacher", "academicYear", "institution"];
        relationshipFields.forEach(field => {
            if (payload[field]) {
                if (Array.isArray(payload[field])) {
                    // If array,取 first item, if object take $id, else string
                    const first = payload[field][0];
                    payload[field] = typeof first === 'object' ? first.$id : first;
                } else if (typeof payload[field] === 'object') {
                    // If object, take $id
                    payload[field] = payload[field].$id;
                }
            }
        });

        console.log("Schedule Update Payload:", JSON.stringify(payload, null, 2));

        return databaseService.update<ClassSchedule>(
            COLLECTIONS.CLASS_SCHEDULE,
            scheduleId,
            payload
        );
    },

    /* ---------------- DELETE (SOFT) ---------------- */

    async deactivate(scheduleId: string) {
        // Fetch current document strictly to repair any bad data
        const current = await this.get(scheduleId);

        const payload: any = {
            isActive: false,
        };

        // Ensure we don't send nulls if they are required (though these should exist)
        // clean up payload
        Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

        return this.update(scheduleId, payload);
    },

    /* ---------------- DELETE (HARD) ---------------- */
    delete(scheduleId: string) {
        return databaseService.delete(COLLECTIONS.CLASS_SCHEDULE, scheduleId);
    },
};
