import { Models } from "react-native-appwrite";
import { AcademicYear } from "./academic-year.type";
import { Class } from "./class.type";
import { Institution } from "./institution.type";
import { Subject } from "./subject.type";
import { User } from "./user.type";

export type AssessmentType =
    | "HOMEWORK"
    | "TEST"
    | "QUIZ"
    | "ASSIGNMENT";

export interface Assessment extends Models.Document {
    title: string;
    type: AssessmentType;

    subject: Subject;        // subjectId
    class: Class;         // classId
    teacher: User;        // userId

    maxMarks: number;
    weightage: number;      // e.g. 0.2, 0.3

    description?: string;
    dueDate?: string;        // Keeping for compatibility if needed

    academicYear: AcademicYear;
    institution: Institution;

    isActive: boolean;
};

export interface AssessmentPayload {
    title: string;
    type: AssessmentType;
    subject: string;
    class: string;
    teacher: string;
    maxMarks: number;
    weightage: number;
    description?: string;
    dueDate?: string
    academicYear: string;
    institution: string;
    isActive: boolean;
}
