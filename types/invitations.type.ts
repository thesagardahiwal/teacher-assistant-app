import { Models } from "react-native-appwrite";
import { UserRole } from "./role.type";


export interface Invitation extends Models.Document {
    userId: string,
    email: string,
    role: UserRole,
    institution: string,
    course: string,
    class: string,
    academicYear: string,
    token: string,
    expiresAt: string,
    used: boolean,
    createdBy: string,
}
