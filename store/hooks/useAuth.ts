import { useCallback } from "react";
import { UserPayload } from "../../types/user.type";
import { useAppDispatch, useAppSelector } from "../hooks";
import { login, logout, restoreSession, signUp, updateUserProfile } from "../slices/auth.slice";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  return {
    ...auth,

    login: useCallback((email: string, password: string, type?: "student" | "teacher") =>
      dispatch(login({ email, password, type })), [dispatch]),

    signUp: useCallback((data: {
      email: string;
      password: string;
      name: string;
      role: any;
      institutionId: string;
    }) => dispatch(signUp(data)), [dispatch]),

    logout: useCallback(() => dispatch(logout()), [dispatch]),

    restoreSession: useCallback(() => dispatch(restoreSession()), [dispatch]),

    updateProfile: useCallback((userId: string, data: Partial<UserPayload>) =>
      dispatch(updateUserProfile({ userId, data })), [dispatch]),
  };
};
