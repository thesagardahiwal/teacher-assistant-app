import { User } from "../types";

export const isAdminProfileComplete = (user: User | null) => {
  if (!user) return false;

  return Boolean(
    user.email &&
    user.institution &&
    user.designation
  );
};
