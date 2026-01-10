import { Models } from "react-native-appwrite";
import { Institution } from "./institution.type";
import { UserRole } from "./role.type";


export interface User extends Models.Document {
    $id: string;
    userId: string; // Appwrite Auth User ID
    name: string;
    email: string;
    role: UserRole;
    department?: string;
    designation?: string;
    isActive: boolean;
    institution: Institution; // Institution ID
    createdAt: string;
    updatedAt: string;
}
