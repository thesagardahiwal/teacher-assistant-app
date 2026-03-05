import { Query } from "react-native-appwrite";
import { Leave, LeavePayload, LeaveStatus } from "@/types/leave.type";
import { COLLECTIONS } from "./appwrite/collections";
import { databaseService } from "./appwrite/database.service";

const leaveSelectQuery = Query.select([
    "*",
    "teacher.*",
    "institution.*",
    "reviewedBy.*",
]);

const normalizeRelationId = (value: any) => {
    if (!value) return value;
    if (Array.isArray(value)) {
        const first = value[0];
        if (!first) return undefined;
        return typeof first === "object" ? first.$id : first;
    }
    return typeof value === "object" ? value.$id : value;
};

const parseDate = (dateString: string) => new Date(`${dateString}T00:00:00`);

const isValidDateString = (dateString: string) => {
    const parsed = parseDate(dateString);
    return !Number.isNaN(parsed.getTime());
};

const calculateTotalDays = (startDate: string, endDate: string) => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    const diffMs = end.getTime() - start.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
};

const isLeaveActiveForOverlap = (leave: Pick<Leave, "status" | "isCancelled">) => {
    return leave.status !== "REJECTED" && leave.status !== "CANCELLED" && !leave.isCancelled;
};

const ensureNoOverlap = async (
    institutionId: string,
    teacherId: string,
    startDate: string,
    endDate: string
) => {
    const limit = 100;
    let offset = 0;

    while (true) {
        const overlapCheck = await databaseService.list<Leave>(
            COLLECTIONS.TEACHER_LEAVES,
            [
                Query.equal("institution", institutionId),
                Query.equal("teacher", teacherId),
                Query.lessThanEqual("startDate", endDate),
                Query.orderDesc("startDate"),
                Query.limit(limit),
                Query.offset(offset),
                Query.select(["status", "isCancelled", "startDate", "endDate"])
            ]
        );

        const overlaps = overlapCheck.documents.some((leave) => {
            if (!isLeaveActiveForOverlap(leave)) return false;
            const existingStart = parseDate(leave.startDate);
            const existingEnd = parseDate(leave.endDate);
            const incomingStart = parseDate(startDate);
            const incomingEnd = parseDate(endDate);
            return existingStart <= incomingEnd && existingEnd >= incomingStart;
        });

        if (overlaps) {
            throw new Error("Leave dates overlap with an existing leave request.");
        }

        if (overlapCheck.documents.length < limit) break;
        offset += limit;
    }
};

const getLeaveInstitutionId = (leave: Leave) =>
    typeof leave.institution === "string" ? leave.institution : leave.institution?.$id;

const getLeaveTeacherId = (leave: Leave) =>
    typeof leave.teacher === "string" ? leave.teacher : leave.teacher?.$id;

export const leaveService = {
    async applyLeave(
        data: Omit<
            LeavePayload,
            | "$id"
            | "status"
            | "appliedAt"
            | "reviewedBy"
            | "reviewedAt"
            | "reviewComment"
            | "totalDays"
            | "isCancelled"
        >
    ) {
        const teacherId = normalizeRelationId(data.teacher);
        const institutionId = normalizeRelationId(data.institution);

        if (!teacherId || !institutionId) {
            throw new Error("Missing teacher or institution information.");
        }

        if (!data.leaveType) {
            throw new Error("Leave type is required.");
        }

        if (!data.reason || !data.reason.trim()) {
            throw new Error("Reason is required.");
        }

        if (!data.startDate || !data.endDate) {
            throw new Error("Start date and end date are required.");
        }

        if (!isValidDateString(data.startDate) || !isValidDateString(data.endDate)) {
            throw new Error("Invalid date format.");
        }

        const start = parseDate(data.startDate);
        const end = parseDate(data.endDate);

        if (start > end) {
            throw new Error("Start date cannot be after end date.");
        }

        await ensureNoOverlap(institutionId, teacherId, data.startDate, data.endDate);

        const payload: Partial<LeavePayload> = {
            teacher: teacherId,
            institution: institutionId,
            leaveType: data.leaveType,
            startDate: data.startDate,
            endDate: data.endDate,
            reason: data.reason.trim(),
            status: "PENDING",
            appliedAt: new Date().toISOString(),
            totalDays: calculateTotalDays(data.startDate, data.endDate),
            isCancelled: false,
        };

        return databaseService.create<Leave>(
            COLLECTIONS.TEACHER_LEAVES,
            payload
        );
    },

    getTeacherLeaves(institutionId: string, teacherId: string, status?: LeaveStatus) {
        const queries = [
            Query.equal("institution", institutionId),
            Query.equal("teacher", teacherId),
            Query.orderDesc("startDate"),
            leaveSelectQuery,
        ];

        if (status) {
            queries.push(Query.equal("status", status));
        }

        return databaseService.list<Leave>(
            COLLECTIONS.TEACHER_LEAVES,
            queries
        );
    },

    getInstitutionLeaves(institutionId: string, status?: LeaveStatus) {
        const queries = [
            Query.equal("institution", institutionId),
            Query.orderDesc("startDate"),
            leaveSelectQuery,
        ];

        if (status) {
            queries.push(Query.equal("status", status));
        }

        return databaseService.list<Leave>(
            COLLECTIONS.TEACHER_LEAVES,
            queries
        );
    },

    async approveLeave(leaveId: string, institutionId: string, reviewedBy: string) {
        const leave = await databaseService.get<Leave>(
            COLLECTIONS.TEACHER_LEAVES,
            leaveId,
            [leaveSelectQuery]
        );

        const leaveInstitutionId = getLeaveInstitutionId(leave);
        if (leaveInstitutionId !== institutionId) {
            throw new Error("Unauthorized access to this leave request.");
        }

        if (leave.status !== "PENDING") {
            throw new Error("Only pending leaves can be approved.");
        }

        const payload: Partial<LeavePayload> = {
            status: "APPROVED",
            reviewedBy,
            reviewedAt: new Date().toISOString(),
            isCancelled: false,
        };

        const updated = await databaseService.update<Leave>(
            COLLECTIONS.TEACHER_LEAVES,
            leaveId,
            payload as any
        );

        // TODO: integrate attendance marking for approved leaves.
        return updated;
    },

    async rejectLeave(leaveId: string, institutionId: string, reviewedBy: string, reviewComment: string) {
        const comment = reviewComment?.trim();
        if (!comment) {
            throw new Error("Review comment is required to reject a leave.");
        }

        const leave = await databaseService.get<Leave>(
            COLLECTIONS.TEACHER_LEAVES,
            leaveId,
            [leaveSelectQuery]
        );

        const leaveInstitutionId = getLeaveInstitutionId(leave);
        if (leaveInstitutionId !== institutionId) {
            throw new Error("Unauthorized access to this leave request.");
        }

        if (leave.status !== "PENDING") {
            throw new Error("Only pending leaves can be rejected.");
        }

        const payload: Partial<LeavePayload> = {
            status: "REJECTED",
            reviewedBy,
            reviewedAt: new Date().toISOString(),
            reviewComment: comment,
            isCancelled: false,
        };

        return databaseService.update<Leave>(
            COLLECTIONS.TEACHER_LEAVES,
            leaveId,
            payload as any
        );
    },

    async cancelLeave(leaveId: string, institutionId: string, teacherId: string) {
        const leave = await databaseService.get<Leave>(
            COLLECTIONS.TEACHER_LEAVES,
            leaveId,
            [leaveSelectQuery]
        );

        const leaveInstitutionId = getLeaveInstitutionId(leave);
        if (leaveInstitutionId !== institutionId) {
            throw new Error("Unauthorized access to this leave request.");
        }

        const leaveTeacherId = getLeaveTeacherId(leave);
        if (leaveTeacherId !== teacherId) {
            throw new Error("Only the requesting teacher can cancel this leave.");
        }

        if (leave.status !== "PENDING") {
            throw new Error("Only pending leaves can be cancelled.");
        }

        const payload: Partial<LeavePayload> = {
            status: "CANCELLED",
            isCancelled: true,
        };

        return databaseService.update<Leave>(
            COLLECTIONS.TEACHER_LEAVES,
            leaveId,
            payload as any
        );
    },
};
