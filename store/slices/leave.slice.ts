import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { leaveService } from "../../services";
import { Leave, LeavePayload, LeaveStatus } from "../../types";

interface LeavesState {
    data: Leave[];
    loading: boolean;
    error: string | null;
}

const initialState: LeavesState = {
    data: [],
    loading: false,
    error: null,
};

export const fetchTeacherLeaves = createAsyncThunk(
    "leaves/fetchTeacher",
    async ({ institutionId, teacherId, status }: { institutionId: string; teacherId: string; status?: LeaveStatus }) => {
        const res = await leaveService.getTeacherLeaves(institutionId, teacherId, status);
        return res.documents;
    }
);

export const fetchInstitutionLeaves = createAsyncThunk(
    "leaves/fetchInstitution",
    async ({ institutionId, status }: { institutionId: string; status?: LeaveStatus }) => {
        const res = await leaveService.getInstitutionLeaves(institutionId, status);
        return res.documents;
    }
);

export const applyLeave = createAsyncThunk(
    "leaves/apply",
    async (data: Omit<
        LeavePayload,
        | "$id"
        | "status"
        | "appliedAt"
        | "reviewedBy"
        | "reviewedAt"
        | "reviewComment"
        | "totalDays"
        | "isCancelled"
    >) => {
        return leaveService.applyLeave(data);
    }
);

export const approveLeave = createAsyncThunk(
    "leaves/approve",
    async ({ leaveId, institutionId, reviewedBy }: { leaveId: string; institutionId: string; reviewedBy: string }) => {
        return leaveService.approveLeave(leaveId, institutionId, reviewedBy);
    }
);

export const rejectLeave = createAsyncThunk(
    "leaves/reject",
    async ({ leaveId, institutionId, reviewedBy, reviewComment }: { leaveId: string; institutionId: string; reviewedBy: string; reviewComment: string }) => {
        return leaveService.rejectLeave(leaveId, institutionId, reviewedBy, reviewComment);
    }
);

export const cancelLeave = createAsyncThunk(
    "leaves/cancel",
    async ({ leaveId, institutionId, teacherId }: { leaveId: string; institutionId: string; teacherId: string }) => {
        return leaveService.cancelLeave(leaveId, institutionId, teacherId);
    }
);

const leaveSlice = createSlice({
    name: "leaves",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTeacherLeaves.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTeacherLeaves.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchTeacherLeaves.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to load leaves";
            })
            .addCase(fetchInstitutionLeaves.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchInstitutionLeaves.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchInstitutionLeaves.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to load leaves";
            })
            .addCase(applyLeave.fulfilled, (state, action) => {
                state.data = [action.payload, ...state.data];
            })
            .addCase(approveLeave.fulfilled, (state, action) => {
                state.data = state.data.map((leave) =>
                    leave.$id === action.payload.$id ? action.payload : leave
                );
            })
            .addCase(rejectLeave.fulfilled, (state, action) => {
                state.data = state.data.map((leave) =>
                    leave.$id === action.payload.$id ? action.payload : leave
                );
            })
            .addCase(cancelLeave.fulfilled, (state, action) => {
                state.data = state.data.map((leave) =>
                    leave.$id === action.payload.$id ? action.payload : leave
                );
            });
    },
});

export default leaveSlice.reducer;
