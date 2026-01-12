import { UserPayload } from "../../types/user.type";
import { useAppDispatch, useAppSelector } from "../hooks";
import { login, logout, restoreSession, signUp, updateUserProfile } from "../slices/auth.slice";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  return {
    ...auth,

    login: (email: string, password: string) =>
      dispatch(login({ email, password })),

    signUp: (data: {
      email: string;
      password: string;
      name: string;
      role: any;
      institutionId: string;
    }) => dispatch(signUp(data)),

    logout: () => dispatch(logout()),

    restoreSession: () => dispatch(restoreSession()),

    updateProfile: (userId: string, data: Partial<UserPayload>) =>
      dispatch(updateUserProfile({ userId, data })),
  };
};
