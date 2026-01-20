import { Models } from "react-native-appwrite";
import { Assessment } from "./assessment.type";
import { Institution } from "./institution.type";
import { Student } from "./student.type";
import { User } from "./user.type";

export interface AssessmentResult extends Models.Document {
    $id: string;
    assessment: Assessment;     // assessmentId
    student: Student;        // studentId

    obtainedMarks: number;
    remarks?: string;

    totalMarks: number;

    evaluatedBy: User;    // teacherId
    evaluatedAt: string;    // ISO string

    institution: Institution;
}

export interface AssessmentResultPayload {
    assessment: string;
    student: string;
    obtainedMarks: number;
    remarks?: string;
    totalMarks: number;
    evaluatedBy: string;
    evaluatedAt: string;
    institution: string;
}
