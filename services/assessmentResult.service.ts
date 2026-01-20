import { COLLECTIONS } from "@/services/appwrite/collections";
import { databaseService } from "@/services/appwrite/database.service";
import { AssessmentResult, AssessmentResultPayload } from "@/types/assessmentResult.type";
import { Query } from "react-native-appwrite";

const query = Query.select([
    "*",
    "assessment.*",
    "student.*",
    "evaluatedBy.*",
    "institution.*",
])

export const assessmentResultService = {
    /* ---------------- CREATE / UPDATE ---------------- */

    upsert(data: AssessmentResultPayload) {
        return databaseService.create<AssessmentResult>(
            COLLECTIONS.ASSESSMENT_RESULTS,
            data
        );
    },

    /* ---------------- LIST ---------------- */

    listByAssessment(
        institutionId: string,
        assessmentId: string
    ) {
        return databaseService.list<AssessmentResult>(
            COLLECTIONS.ASSESSMENT_RESULTS,
            [
                Query.equal("institution", institutionId),
                Query.equal("assessment", assessmentId),
                query
            ]
        );
    },

    listByStudent(
        institutionId: string,
        studentId: string
    ) {
        return databaseService.list<AssessmentResult>(
            COLLECTIONS.ASSESSMENT_RESULTS,
            [
                Query.equal("institution", institutionId),
                Query.equal("student", studentId),
                query
            ]
        );
    },
    delete(resultId: string) {
        return databaseService.delete(
            COLLECTIONS.ASSESSMENT_RESULTS,
            resultId
        );
    },
};
