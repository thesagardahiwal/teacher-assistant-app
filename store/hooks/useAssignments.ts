import { useAppDispatch, useAppSelector } from "../hooks";
import { createAssignment, deleteAssignment, fetchAssignments } from "../slices/assignment.slice";

export const useAssignments = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.assignments);

  return {
    ...state,
    fetchAssignments: (institutionId: string) =>
      dispatch(fetchAssignments(institutionId)),
    createAssignment: (data: Partial<any>) =>
      dispatch(createAssignment(data)),
    deleteAssignment: (id: string) =>
      dispatch(deleteAssignment(id)),
  };
};
