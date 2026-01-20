import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { assessmentService } from "../../services/assessment.service";
import { Assessment, AssessmentPayload } from "../../types/assessment.type";

/* ---------- STATE TYPE ---------- */

interface AssessmentState {
    items: Assessment[];
    loading: boolean;
    error: string | null;
    lastFetched: Record<string, number>; // Timestamp mapping for cache keys
}

const initialState: AssessmentState = {
    items: [],
    loading: false,
    error: null,
    lastFetched: {},
};

const CACHE_KEY_PREFIX = "assessments_";

/* ---------- ASYNC THUNKS ---------- */

export const fetchAssessmentsByClass = createAsyncThunk(
    "assessments/fetchByClass",
    async (
        {
            institutionId,
            classId,
            subjectId,
            forceRefresh = false,
        }: {
            institutionId: string;
            classId: string;
            subjectId?: string;
            forceRefresh?: boolean;
        },
        { rejectWithValue, dispatch }
    ) => {
        try {
            const cacheKey = `${CACHE_KEY_PREFIX}class_${classId}${subjectId ? `_${subjectId}` : ""}`;

            // 1. Try to load from cache first if not forced
            if (!forceRefresh) {
                const cached = await AsyncStorage.getItem(cacheKey);
                if (cached) {
                    const { data, timestamp } = JSON.parse(cached);
                    // Optional: Check TTL here if needed
                    return { data, fromCache: true };
                }
            }

            // 2. Fetch from API
            const response = await assessmentService.listByClass(
                institutionId,
                classId,
                subjectId
            );

            const data = response.documents;

            // 3. Save to cache
            await AsyncStorage.setItem(
                cacheKey,
                JSON.stringify({ data, timestamp: Date.now() })
            );

            return { data, fromCache: false };
        } catch (err) {
            return rejectWithValue((err as Error).message || "Failed to fetch assessments");
        }
    }
);

export const fetchAssessmentsByTeacher = createAsyncThunk(
    "assessments/fetchByTeacher",
    async (
        {
            institutionId,
            teacherId,
            forceRefresh = false,
        }: {
            institutionId: string;
            teacherId: string;
            forceRefresh?: boolean;
        },
        { rejectWithValue }
    ) => {
        try {
            const cacheKey = `${CACHE_KEY_PREFIX}teacher_${teacherId}`;

            if (!forceRefresh) {
                const cached = await AsyncStorage.getItem(cacheKey);
                if (cached) {
                    const { data } = JSON.parse(cached);
                    return { data, fromCache: true };
                }
            }

            const response = await assessmentService.listByTeacher(institutionId, teacherId);
            const data = response.documents;

            await AsyncStorage.setItem(
                cacheKey,
                JSON.stringify({ data, timestamp: Date.now() })
            );

            return { data, fromCache: false };
        } catch (err) {
            return rejectWithValue((err as Error).message || "Failed to fetch assessments");
        }
    }
);

export const createAssessment = createAsyncThunk(
    "assessments/create",
    async (data: AssessmentPayload, { rejectWithValue }) => {
        try {
            const response = await assessmentService.create(data);
            // We should ideally invalidate cache here, handled in reducers or by caller re-fetching
            return response;
        } catch (err) {
            return rejectWithValue((err as Error).message || "Failed to create assessment");
        }
    }
);

/* ---------- SLICE ---------- */

const assessmentSlice = createSlice({
    name: "assessments",
    initialState,
    reducers: {
        clearAssessments: (state) => {
            state.items = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch By Class
            .addCase(fetchAssessmentsByClass.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAssessmentsByClass.fulfilled, (state, action) => {
                state.loading = false;
                // Simple strategy: Replace items. 
                // For more complex apps, we might want to merge or store by ID mapping.
                state.items = action.payload.data;
            })
            .addCase(fetchAssessmentsByClass.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Fetch By Teacher
            .addCase(fetchAssessmentsByTeacher.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAssessmentsByTeacher.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
            })
            .addCase(fetchAssessmentsByTeacher.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Create
            .addCase(createAssessment.pending, (state) => {
                state.loading = true;
            })
            .addCase(createAssessment.fulfilled, (state, action) => {
                state.loading = false;
                state.items.unshift(action.payload); // Add to top
            })
            .addCase(createAssessment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearAssessments } = assessmentSlice.actions;
export default assessmentSlice.reducer;
