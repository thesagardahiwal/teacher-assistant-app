import { COLLECTIONS } from "@/services/appwrite/collections";
import { databaseService } from "@/services/appwrite/database.service";
import { Assessment, AssessmentPayload } from "@/types/assessment.type";
import { Query } from "react-native-appwrite";

const query = Query.select([
    "*",
    "class.*",
    "subject.*",
    "teacher.*",
    "academicYear.*",
    "institution.*",
])

export const assessmentService = {
    /* ---------------- CREATE ---------------- */

    create(data: AssessmentPayload) {
        return databaseService.create<Assessment>(
            COLLECTIONS.ASSESSMENTS,
            data
        );
    },

    /* ---------------- GET ---------------- */

    get(id: string) {
        return databaseService.get<Assessment>(
            COLLECTIONS.ASSESSMENTS,
            id,
        );
    },

    /* ---------------- LIST ---------------- */

    listByClass(
        institutionId: string,
        classeId: string,
        subjectId?: string
    ) {
        const queries = [
            Query.equal("institution", institutionId),
            Query.equal("class", classeId),
            Query.equal("isActive", true),
            query
        ];

        if (subjectId) {
            queries.push(Query.equal("subject", subjectId));
        }

        return databaseService.list<Assessment>(
            COLLECTIONS.ASSESSMENTS,
            queries
        );
    },

    listByTeacher(
        institutionId: string,
        teacherId: string
    ) {
        return databaseService.list<Assessment>(
            COLLECTIONS.ASSESSMENTS,
            [
                Query.equal("institution", institutionId),
                Query.equal("teacher", teacherId),
                Query.equal("isActive", true),
                query
            ]
        );
    },

    /* ---------------- UPDATE ---------------- */

    update(id: string, data: Partial<Assessment>) {
        return databaseService.update<Assessment>(
            COLLECTIONS.ASSESSMENTS,
            id,
            data
        );
    },

    /* ---------------- DELETE (SOFT) ---------------- */

    deactivate(id: string) {
        return databaseService.update<Assessment>(
            COLLECTIONS.ASSESSMENTS,
            id,
            { isActive: false }
        );
    },
};
