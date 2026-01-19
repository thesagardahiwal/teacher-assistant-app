import { databases } from "@/services/appwrite/client";
import { COLLECTIONS } from "@/services/appwrite/collections";
import { attendanceService } from "@/services/attendance.service";

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
    },
    ID: { unique: jest.fn(() => "unique_id") },
}));

describe("Attendance Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("lists attendance", async () => {
        const mockDocuments = [{ $id: "a1", date: "2024-01-01" }];
        (databases.listDocuments as jest.Mock).mockResolvedValue({
            documents: mockDocuments,
            total: 1,
        });

        const res = await attendanceService.list("inst1");

        expect(databases.listDocuments).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.ATTENDANCE,
            expect.arrayContaining([
                expect.objectContaining({ method: "equal", attr: "institution", val: "inst1" }),
                expect.objectContaining({ method: "select" })
            ])
        );
        expect(res.documents).toEqual(mockDocuments);
    });

    it("gets attendance", async () => {
        const mockDoc = { $id: "a1", date: "2024-01-01" };
        (databases.getDocument as jest.Mock).mockResolvedValue(mockDoc);

        const res = await attendanceService.get("a1");

        expect(databases.getDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.ATTENDANCE,
            "a1",
            undefined
        );
        expect(res).toEqual(mockDoc);
    });

    it("creates attendance", async () => {
        const payload = {
            class: "c1",
            subject: "s1",
            teacher: "t1",
            date: "2024-01-01",
            institution: "inst1"
        };
        (databases.createDocument as jest.Mock).mockResolvedValue({
            ...payload,
            $id: "new_id",
        });

        const res = await attendanceService.create(payload as any);

        expect(databases.createDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.ATTENDANCE,
            expect.anything(),
            payload,
            undefined
        );
        expect(res.$id).toBe("new_id");
    });

    it("updates attendance", async () => {
        const payload = { date: "2024-01-02" };
        (databases.updateDocument as jest.Mock).mockResolvedValue({
            $id: "a1",
            ...payload,
        });

        const res = await attendanceService.update("a1", payload);

        expect(databases.updateDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.ATTENDANCE,
            "a1",
            payload
        );
        expect(res.date).toBe(payload.date);
    });

    it("deletes attendance", async () => {
        (databases.deleteDocument as jest.Mock).mockResolvedValue({});

        await attendanceService.delete("a1");

        expect(databases.deleteDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.ATTENDANCE,
            "a1"
        );
    });
});
