import { Models } from "react-native-appwrite";
import { Institution } from "./institution.type";
import { User } from "./user.type";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export type LeaveType = "SICK" | "CASUAL" | "PAID" | "UNPAID" | "EMERGENCY" | "OTHER";

export interface Leave extends Models.Document {
    $id: string;
    teacher: User;
    institution: Institution;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
    status: LeaveStatus;
    appliedAt: string;
    reviewedBy?: User;
    reviewedAt?: string;
    reviewComment?: string;
    totalDays: number;
    isCancelled: boolean;
}

export interface LeavePayload {
    $id?: string;
    teacher: string;
    institution: string;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
    status: LeaveStatus;
    appliedAt: string;
    reviewedBy?: string;
    reviewedAt?: string;
    reviewComment?: string;
    totalDays: number;
    isCancelled: boolean;
}
