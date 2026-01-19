import { databases } from "@/services/appwrite/client";
import { COLLECTIONS } from "@/services/appwrite/collections";
import { attendanceRecordService } from "@/services/attendanceRecord.service";

jest.mock("@/services/appwrite/client", () => ({
    databases: {
        listDocuments: jest.fn(),
        createDocument: jest.fn(),
        updateDocument: jest.fn(),
        deleteDocument: jest.fn(),
        getDocument: jest.fn(),
    },
}));

jest.mock("react-native-appwrite", () => ({
    Query: {
        equal: jest.fn((attr, val) => ({ method: "equal", attr, val })),
        select: jest.fn((attrs) => ({ method: "select", attrs })),
        orderDesc: jest.fn((attr) => ({ method: "orderDesc", attr })),
    },
    ID: { unique: jest.fn(() => "unique_id") },
}));

describe("Attendance Record Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("lists attendance records", async () => {
        const mockDocuments = [{ $id: "ar1", present: true }];
        (databases.listDocuments as jest.Mock).mockResolvedValue({
            documents: mockDocuments,
            total: 1,
        });

        const res = await attendanceRecordService.list("inst1");

        expect(databases.listDocuments).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.ATTENDANCE_RECORDS,
            expect.arrayContaining([
                expect.objectContaining({ method: "equal", attr: "institution", val: "inst1" }),
                expect.objectContaining({ method: "select" })
            ])
        );
        expect(res.documents).toEqual(mockDocuments);
    });

    it("lists records by attendance", async () => {
        const mockDocuments = [{ $id: "ar1", attendance: { $id: "a1" } }];
        (databases.listDocuments as jest.Mock).mockResolvedValue({
            documents: mockDocuments,
            total: 1,
        });

        const res = await attendanceRecordService.listByAttendance("a1");

        expect(databases.listDocuments).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.ATTENDANCE_RECORDS,
            expect.arrayContaining([
                expect.objectContaining({ method: "equal", attr: "attendance", val: "a1" }),
                expect.objectContaining({ method: "select" })
            ])
        );
        expect(res.documents).toEqual(mockDocuments);
    });

    it("lists records by student", async () => {
        const mockDocuments = [{ $id: "ar1", student: { $id: "s1" } }];
        (databases.listDocuments as jest.Mock).mockResolvedValue({
            documents: mockDocuments,
            total: 1,
        });

        const res = await attendanceRecordService.listByStudent("s1");

        expect(databases.listDocuments).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.ATTENDANCE_RECORDS,
            expect.arrayContaining([
                expect.objectContaining({ method: "equal", attr: "student", val: "s1" }),
                expect.objectContaining({ method: "select" }),
                expect.objectContaining({ method: "orderDesc", attr: "$createdAt" })
            ])
        );
        expect(res.documents).toEqual(mockDocuments);
    });

    it("creates an attendance record", async () => {
        const payload = {
            attendance: "a1",
            student: "s1",
            present: true,
            institution: "inst1"
        };
        (databases.createDocument as jest.Mock).mockResolvedValue({
            ...payload,
            $id: "new_id",
        });

        const res = await attendanceRecordService.create(payload as any);

        expect(databases.createDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.ATTENDANCE_RECORDS,
            expect.anything(),
            payload,
            undefined
        );
        expect(res.$id).toBe("new_id");
    });

    it("updates an attendance record", async () => {
        const payload = { present: false };
        (databases.updateDocument as jest.Mock).mockResolvedValue({
            $id: "ar1",
            ...payload,
        });

        const res = await attendanceRecordService.update("ar1", payload);

        expect(databases.updateDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.ATTENDANCE_RECORDS,
            "ar1",
            payload
        );
        expect(res.present).toBe(false);
    });

    it("deletes an attendance record", async () => {
        (databases.deleteDocument as jest.Mock).mockResolvedValue({});

        await attendanceRecordService.delete("ar1");

        expect(databases.deleteDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.ATTENDANCE_RECORDS,
            "ar1"
        );
    });
});
