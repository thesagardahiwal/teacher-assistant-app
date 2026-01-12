import { User } from "../types/user.type";

export const isAdminProfileComplete = (user: User | null) => {
  if (!user) return false;

  return Boolean(
    user.email &&
    user.institution
  );
};
