import { Models } from "react-native-appwrite";
import { AcademicYear } from "./academic-year.type";
import { Course } from "./course.type";
import { Institution } from "./institution.type";

export interface Class extends Models.Document {
    $id: string;
    course: string | Course;         // relationship
    academicYear: string | AcademicYear;
    year: number;                    // 1,2,3,4
    semester: number;                // 1–8
    division: string;                // A, B, C
    institution: Institution;
    createdAt: string;
    updatedAt: string;
}


export interface ClassPayload extends Models.Document {
    $id: string;
    course: string | Course;         // relationship
    academicYear: string | AcademicYear;
    year: number;                    // 1,2,3,4
    semester: number;                // 1–8
    division: string;                // A, B, C
    institution: string;
    createdAt: string;
    updatedAt: string;
}
