import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchSubjectPerformance } from "../slices/performance.slice";

export const usePerformance = () => {
    const dispatch = useAppDispatch();
    const { subjectPerformance, loading, error } = useAppSelector((state) => state.performance);

    const getSubjectPerformance = useCallback(
        (institutionId: string, studentId: string, subjectId: string, forceRefresh = false) => {
            dispatch(fetchSubjectPerformance({ institutionId, studentId, subjectId, forceRefresh }));
        },
        [dispatch]
    );

    const getPerformanceData = (studentId: string, subjectId: string) => {
        return subjectPerformance[`${studentId}_${subjectId}`];
    };

    return {
        subjectPerformance, // Raw map
        getPerformanceData, // Helper
        isLoading: loading,
        error,
        getSubjectPerformance
    };
};
