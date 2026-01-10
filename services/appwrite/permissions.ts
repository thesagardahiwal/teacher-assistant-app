import { Permission, Role } from "react-native-appwrite";

export const permissions = {
  adminOnly() {
    return [
      Permission.read(Role.team("admin")),
      Permission.create(Role.team("admin")),
      Permission.update(Role.team("admin")),
      Permission.delete(Role.team("admin")),
    ];
  },

  teacherOwned(userId: string) {
    return [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
    ];
  },

  publicRead() {
    return [Permission.read(Role.any())];
  },
};
