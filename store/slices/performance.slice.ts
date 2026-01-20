import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { performanceService } from "../../services/performance.service";
import { SubjectPerformance } from "../../types/performance.type";

interface PerformanceState {
    subjectPerformance: Record<string, SubjectPerformance>; // Key: "${studentId}_${subjectId}"
    loading: boolean;
    error: string | null;
}

const initialState: PerformanceState = {
    subjectPerformance: {},
    loading: false,
    error: null,
};

const CACHE_KEY_PREFIX = "perf_";

export const fetchSubjectPerformance = createAsyncThunk(
    "performance/fetchSubject",
    async (
        {
            institutionId,
            studentId,
            subjectId,
            forceRefresh = false,
        }: {
            institutionId: string;
            studentId: string;
            subjectId: string;
            forceRefresh?: boolean;
        },
        { rejectWithValue }
    ) => {
        try {
            const cacheKey = `${CACHE_KEY_PREFIX}${studentId}_${subjectId}`;

            // 1. Try Cache
            if (!forceRefresh) {
                const cached = await AsyncStorage.getItem(cacheKey);
                if (cached) {
                    const { data } = JSON.parse(cached);
                    // Check TTL if needed, e.g. valid for 1 hour
                    return { data, key: `${studentId}_${subjectId}`, fromCache: true };
                }
            }

            // 2. Fetch API
            const data = await performanceService.calculateSubjectPerformance(
                institutionId,
                studentId,
                subjectId
            );

            // 3. Save Cache
            await AsyncStorage.setItem(
                cacheKey,
                JSON.stringify({ data, timestamp: Date.now() })
            );

            return { data, key: `${studentId}_${subjectId}`, fromCache: false };
        } catch (err) {
            return rejectWithValue((err as Error).message || "Failed to fetch performance");
        }
    }
);

const performanceSlice = createSlice({
    name: "performance",
    initialState,
    reducers: {
        clearPerformance: (state) => {
            state.subjectPerformance = {};
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSubjectPerformance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSubjectPerformance.fulfilled, (state, action) => {
                state.loading = false;
                state.subjectPerformance[action.payload.key] = action.payload.data;
            })
            .addCase(fetchSubjectPerformance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearPerformance } = performanceSlice.actions;
export default performanceSlice.reducer;
