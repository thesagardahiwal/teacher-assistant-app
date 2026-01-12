import { User } from "@/types/user.type";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
        try {
            return await account.createEmailPasswordSession(email, password);
        } catch (error) {
            // Optionally, handle error more specifically based on error type/shape
            console.error("Login failed:", error);
            throw error;
        }
    },

    async logout() {
        try {
            await AsyncStorage.clear();
        } catch (e) {
            // Logging but not blocking, since clearing app cache might fail independently
            console.error("Failed to clear AsyncStorage on logout:", e);
        }
        try {
            return await account.deleteSession("current");
        } catch (error) {
            console.error("Logout failed:", error);
            throw error;
        }
    },

    async getCurrentAccount() {
        try {
            return await account.get();
        } catch {
            // Optionally, log for debugging
            // console.error("Failed to get current account:", error);
            return null;
        }
    },

    async signUp(payload: SignUpPayload) {
        const { email, password, name, role, institutionId } = payload;
        try {
            try {
                await account.deleteSession("current");
            } catch {
                // In case there is no session, ignore error
            }

            let user;
            try {
                user = await account.create(
                    ID.unique(),
                    email,
                    password,
                    name
                );
            } catch (err) {
                console.error("Account creation failed:", err);
                throw err;
            }

            try {
                await databaseService.create(COLLECTIONS.USERS, {
                    userId: user.$id,
                    email,
                    name,
                    role,
                    institution: institutionId,
                    isActive: true,
                });
            } catch (err) {
                console.error("Failed to create user profile document:", err);
                // Clean up: try to delete user just created (optional)
                throw err;
            }

            // 3. Auto-login
            try {
                await this.login(email, password);
            } catch (err) {
                console.error("Auto-login after sign up failed:", err);
                throw err;
            }

        } catch (error) {
            console.error("Error during signUp:", error);
            throw error;
        }
    },

    async createUser(payload: SignUpPayload) {
        const { email, password, name, role, institutionId } = payload;
        try {
            // 1. Create Account (Client SDK allows this without logging out)
            const user = await account.create(
                ID.unique(),
                email,
                password,
                name
            );

            // 2. Create User Document
            await databaseService.create(COLLECTIONS.USERS, {
                userId: user.$id,
                email,
                name,
                role,
                institution: institutionId,
                isActive: true,
            });

            return user;
        } catch (error) {
            console.error("Error during createUser:", error);
            throw error;
        }
    },
};
