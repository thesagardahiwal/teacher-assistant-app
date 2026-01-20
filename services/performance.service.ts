import { SubjectPerformance } from "@/types/performance.type";
import { assessmentResultService } from "./assessmentResult.service";
import { attendanceRecordService } from "./attendanceRecord.service";

export const performanceService = {
    async calculateSubjectPerformance(
        institutionId: string,
        studentId: string,
        subjectId: string
    ): Promise<SubjectPerformance> {
        /* ---------------- ATTENDANCE ---------------- */

        const stats = await attendanceRecordService.getSubjectAttendanceStats(
            institutionId,
            studentId,
            subjectId
        );

        const attendancePercentage =
            stats.total > 0
                ? (stats.present / stats.total) * 100
                : 0;

        const attendanceScore = attendancePercentage * 0.3;

        /* ---------------- ASSESSMENTS ---------------- */

        const results = await assessmentResultService.listByStudent(
            institutionId,
            studentId
        );

        let totalWeightedScore = 0;

        for (const r of results.documents) {
            // We use the expanded assessment object directly from the result
            const assessment = r.assessment;

            const percentage =
                (r.obtainedMarks / assessment.maxMarks) * 100;

            totalWeightedScore += percentage * assessment.weightage;
        }

        /* ---------------- FINAL ---------------- */

        return {
            subjectId,
            attendancePercentage,
            attendanceScore,
            assessmentScore: totalWeightedScore,
            totalScore: attendanceScore + totalWeightedScore,
        };
    },
};
