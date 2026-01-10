import { User } from "@/types";
import { ID } from "react-native-appwrite";
import { account } from "./client";
import { COLLECTIONS } from "./collections";
import { databaseService } from "./database.service";

interface SignUpPayload {
    email: string;
    password: string;
    name: string;
    role: User["role"];
    institutionId: string;
}

export const authService = {
    async login(email: string, password: string) {
        return await account.createEmailPasswordSession(email, password);
    },

    async logout() {
        return await account.deleteSession("current");
    },

    async getCurrentAccount() {
        try {
            return await account.get();
        } catch {
            return null;
        }
    },

    async signUp(payload: SignUpPayload) {
        const { email, password, name, role, institutionId } = payload;
        try {
            const user = await account.create(
                ID.unique(),
                email,
                password,
                name
            );

            // 2. Create Profile Document
            await databaseService.create(COLLECTIONS.USERS, {
                userId: user.$id,
                email,
                name,
                role,
                institution: institutionId,
                isActive: true,
            });

            // 3. Auto-login
            await this.login(email, password);
        } catch (error) {
            console.log("Error during signUp:", error);
        }
    },
};
