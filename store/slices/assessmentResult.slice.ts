import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { assessmentResultService } from "../../services/assessmentResult.service";
import { AssessmentResult, AssessmentResultPayload } from "../../types/assessmentResult.type";

interface AssessmentResultState {
    results: AssessmentResult[];
    loading: boolean;
    error: string | null;
}

const initialState: AssessmentResultState = {
    results: [],
    loading: false,
    error: null,
};

const CACHE_KEY_PREFIX = "results_";

export const fetchResultsByAssessment = createAsyncThunk(
    "results/fetchByAssessment",
    async (
        {
            institutionId,
            assessmentId,
            forceRefresh = false,
        }: {
            institutionId: string;
            assessmentId: string;
            forceRefresh?: boolean;
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await assessmentResultService.listByAssessment(institutionId, assessmentId);
            const data = response.documents;

            return { data };
        } catch (err) {
            return rejectWithValue((err as Error).message || "Failed to fetch results");
        }
    }
);

export const fetchResultsByStudent = createAsyncThunk(
    "results/fetchByStudent",
    async (
        {
            institutionId,
            studentId,
            forceRefresh = false,
        }: {
            institutionId: string;
            studentId: string;
            forceRefresh?: boolean;
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await assessmentResultService.listByStudent(institutionId, studentId);
            const data = response.documents;

            return { data, fromCache: false };
        } catch (err) {
            return rejectWithValue((err as Error).message || "Failed to fetch results");
        }
    }
);

export const submitResult = createAsyncThunk(
    "results/submit",
    async (data: AssessmentResultPayload, { rejectWithValue }) => {
        try {
            const response = await assessmentResultService.upsert(data);
            return response;
        } catch (err) {
            return rejectWithValue((err as Error).message || "Failed to submit result");
        }
    }
);

const assessmentResultSlice = createSlice({
    name: "assessmentResults",
    initialState,
    reducers: {
        clearResults: (state) => {
            state.results = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch By Assessment
            .addCase(fetchResultsByAssessment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchResultsByAssessment.fulfilled, (state, action) => {
                state.loading = false;
                state.results = action.payload.data;
            })
            .addCase(fetchResultsByAssessment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Fetch By Student
            .addCase(fetchResultsByStudent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchResultsByStudent.fulfilled, (state, action) => {
                state.loading = false;
                state.results = action.payload.data;
            })
            .addCase(fetchResultsByStudent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Submit
            .addCase(submitResult.pending, (state) => {
                state.loading = true;
            })
            .addCase(submitResult.fulfilled, (state, action) => {
                state.loading = false;
                // Optimistically update or just prepend
                const index = state.results.findIndex(r => r.$id === action.payload.$id);
                if (index >= 0) {
                    state.results[index] = action.payload;
                } else {
                    state.results.push(action.payload);
                }
            })
            .addCase(submitResult.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearResults } = assessmentResultSlice.actions;
export default assessmentResultSlice.reducer;
