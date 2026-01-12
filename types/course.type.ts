import { Models } from "react-native-appwrite";
import { Institution } from "./institution.type";

export interface Course extends Models.Document {
    $id: string;
    name: string;
    code: string;
    durationYears: number;
    isActive: boolean;
    institution: Institution;
}

export interface CoursePayload extends Models.Document {
    $id: string;
    name: string;
    code: string;
    durationYears: number;
    isActive: boolean;
    institution: string;
}
