import { LeavePayload, LeaveStatus } from "../../types";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
    applyLeave,
    approveLeave,
    cancelLeave,
    fetchInstitutionLeaves,
    fetchTeacherLeaves,
    rejectLeave,
} from "../slices/leave.slice";

export const useLeaves = () => {
    const dispatch = useAppDispatch();
    const state = useAppSelector((s) => s.leaves);

    return {
        ...state,
        fetchTeacherLeaves: (institutionId: string, teacherId: string, status?: LeaveStatus) =>
            dispatch(fetchTeacherLeaves({ institutionId, teacherId, status })),
        fetchInstitutionLeaves: (institutionId: string, status?: LeaveStatus) =>
            dispatch(fetchInstitutionLeaves({ institutionId, status })),
        applyLeave: (data: Omit<
            LeavePayload,
            | "$id"
            | "status"
            | "appliedAt"
            | "reviewedBy"
            | "reviewedAt"
            | "reviewComment"
            | "totalDays"
            | "isCancelled"
        >) => dispatch(applyLeave(data)),
        approveLeave: (leaveId: string, institutionId: string, reviewedBy: string) =>
            dispatch(approveLeave({ leaveId, institutionId, reviewedBy })),
        rejectLeave: (leaveId: string, institutionId: string, reviewedBy: string, reviewComment: string) =>
            dispatch(rejectLeave({ leaveId, institutionId, reviewedBy, reviewComment })),
        cancelLeave: (leaveId: string, institutionId: string, teacherId: string) =>
            dispatch(cancelLeave({ leaveId, institutionId, teacherId })),
    };
};
