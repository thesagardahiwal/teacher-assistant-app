import { COLLECTIONS } from "@/services/appwrite/collections";
import { databaseService } from "@/services/appwrite/database.service";
import { ID, Query } from "react-native-appwrite";
import { Invitation } from "../types/invitations.type";

export const invitationService = {
    createInvite(data: {
        email: string;
        institution: string;
        role: "STUDENT" | "TEACHER";
        course?: string;
        class?: string;
        createdBy: string;
    }) {
        return databaseService.create<Invitation>(COLLECTIONS.INVITATIONS, {
            email: data.email,
            role: data.role,
            institution: data.institution,
            course: data.course || null,
            class: data.class || null,
            token: ID.unique(),
            expiresAt: new Date(
                Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 days
            ).toISOString(),
            used: false,
            createdBy: data.createdBy,
        });
    },

    validate(token: string) {
        return databaseService.list(COLLECTIONS.INVITATIONS, [
            Query.equal("token", token),
            Query.equal("used", false),
        ]);
    },

    markUsed(inviteId: string) {
        return databaseService.update(COLLECTIONS.INVITATIONS, inviteId, {
            used: true,
            usedAt: new Date().toISOString(),
        });
    },

    unmarkUsed(inviteId: string) {
        return databaseService.update(COLLECTIONS.INVITATIONS, inviteId, {
            used: false,
            usedAt: null,
        });
    },
};
