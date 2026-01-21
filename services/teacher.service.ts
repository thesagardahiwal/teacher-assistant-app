import { Query } from "react-native-appwrite";
import { TEACHING_ROLES } from "../types/role.type";
import { User, UserPayload } from "../types/user.type";
import { COLLECTIONS } from "./appwrite/collections";
import { databaseService } from "./appwrite/database.service";
import { invitationService } from "./invitation.service";

export const teacherService = {
  list(institutionId: string) {
    return databaseService.list<User>(
      COLLECTIONS.USERS,
      [
        Query.equal("institution", institutionId),
        Query.equal("role", TEACHING_ROLES),
      ]
    );
  },

  get(teacherId: string) {
    return databaseService.get<User>(
      COLLECTIONS.USERS,
      teacherId
    );
  },

  update(teacherId: string, data: Partial<UserPayload>) {
    return databaseService.update<User>(
      COLLECTIONS.USERS,
      teacherId,
      data as any
    );
  },
  async create(data: Omit<UserPayload, 'userId' | "isActive">) {
    // 1. Create Invitation
    // Teacher invitations might need different fields or just use same structure
    const invitation = await invitationService.createInvite({ // Reusing student invite structure for now, maybe rename method to createInvite later
      email: data.email,
      institution: data.institution,
      role: "TEACHER",
      createdBy: "ADMIN",
    });

    // 2. Create User Document (Teacher Profile)
    const teacher = await databaseService.create<User>(
      COLLECTIONS.USERS,
      {
        ...data,
        userId: `invite:${invitation.token}`,
        isActive: false, // Inactive until accepted
        role: "TEACHER",
      }
    );

    return { teacher, invitation };
  },
};
