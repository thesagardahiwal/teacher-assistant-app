import { useCallback } from "react";
import { AssessmentPayload } from "../../types/assessment.type";
import { useAppDispatch, useAppSelector } from "../hooks";
import { createAssessment, fetchAssessmentsByClass, fetchAssessmentsByTeacher } from "../slices/assessment.slice";

export const useAssessments = () => {
    const dispatch = useAppDispatch();
    const { items, loading, error } = useAppSelector((state) => state.assessments);

    const getAssessmentsByClass = useCallback(
        (institutionId: string, classId: string, subjectId?: string, forceRefresh = false) => {
            dispatch(fetchAssessmentsByClass({ institutionId, classId, subjectId, forceRefresh }));
        },
        [dispatch]
    );

    const getAssessmentsByTeacher = useCallback(
        (institutionId: string, teacherId: string, forceRefresh = false) => {
            dispatch(fetchAssessmentsByTeacher({ institutionId, teacherId, forceRefresh }));
        },
        [dispatch]
    );

    const createNewAssessment = useCallback(
        async (data: AssessmentPayload) => {
            const result = await dispatch(createAssessment(data));
            return result;
        },
        [dispatch]
    );

    return {
        assessments: items,
        isLoading: loading,
        error,
        getAssessmentsByClass,
        getAssessmentsByTeacher,
        createNewAssessment,
    };
};
