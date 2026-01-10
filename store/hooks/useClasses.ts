import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchClasses } from "../slices/class.slice";

export const useClasses = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.classes);

  return {
    ...state,
    fetchClasses: (institutionId: string) =>
      dispatch(fetchClasses(institutionId)),
  };
};
