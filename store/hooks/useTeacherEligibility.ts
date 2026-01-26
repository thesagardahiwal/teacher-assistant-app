import { useInstitutionId } from "@/utils/useInstitutionId";
import { useEffect, useMemo, useState } from "react";
import { useAssignments } from "./useAssignments";
import { useAuth } from "./useAuth";

export const useTeacherEligibility = () => {
    const { user } = useAuth();
    const institutionId = useInstitutionId();
    const { data: assignments, loading, fetchAssignments } = useAssignments();

    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (institutionId && user && user.role === "TEACHER") {
            const userId = user.$id;
            fetchAssignments(institutionId, userId).finally(() => {
                setIsReady(true);
            });
        } else {
            setIsReady(true);
        }
    }, [institutionId, user?.$id, user?.role]);

    const eligibility = useMemo(() => {
        const assignedClasses = Array.from(new Set(assignments.map((a) => a.class?.$id).filter(Boolean)));
        const assignedSubjects = Array.from(new Set(assignments.map((a) => a.subject?.$id).filter(Boolean)));

        const missingRequirements: string[] = [];

        if (assignedClasses.length === 0) {
            missingRequirements.push("No classes assigned");
        }

        if (assignedSubjects.length === 0) {
            missingRequirements.push("No subjects assigned");
        }

        return {
            isEligible: assignedClasses.length > 0 && assignedSubjects.length > 0,
            missingRequirements,
            assignedClasses,
            assignedSubjects
        };
    }, [assignments]);

    return {
        ...eligibility,
        isLoading: loading || !isReady,
        refresh: () => institutionId && user && fetchAssignments(institutionId, user.$id),
    };
};
