import { useAppDispatch, useAppSelector } from "../hooks";
import { createSubject, fetchSubjects, fetchSubjectsByTeacher } from "../slices/subject.slice";

export const useSubjects = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.subjects);

  return {
    ...state,
    fetchSubjects: (institutionId: string) =>
      dispatch(fetchSubjects(institutionId)),
    createSubject: (data: Partial<any>) =>
      dispatch(createSubject(data)),
    fetchSubjectsByTeacher: (institutionId: string, teacherId: string) =>
      dispatch(fetchSubjectsByTeacher({ institutionId, teacherId })),
  };
};
