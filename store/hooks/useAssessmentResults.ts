import { useCallback } from "react";
import { AssessmentResultPayload } from "../../types/assessmentResult.type";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchResultsByAssessment, fetchResultsByStudent, submitResult } from "../slices/assessmentResult.slice";

export const useAssessmentResults = () => {
    const dispatch = useAppDispatch();
    const { results, loading, error } = useAppSelector((state) => state.assessmentResults);

    const getResultsByAssessment = useCallback(
        (institutionId: string, assessmentId: string, forceRefresh = false) => {
            dispatch(fetchResultsByAssessment({ institutionId, assessmentId, forceRefresh }));
        },
        [dispatch]
    );

    const getResultsByStudent = useCallback(
        (institutionId: string, studentId: string, forceRefresh = false) => {
            dispatch(fetchResultsByStudent({ institutionId, studentId, forceRefresh }));
        },
        [dispatch]
    );

    const saveResult = useCallback(
        async (data: AssessmentResultPayload) => {
            const res = await dispatch(submitResult(data));
            return res;
        },
        [dispatch]
    );

    return {
        results,
        isLoading: loading,
        error,
        getResultsByAssessment,
        getResultsByStudent,
        saveResult
    };
};
