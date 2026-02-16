import { databases } from "@/services/appwrite/client";
import { COLLECTIONS } from "@/services/appwrite/collections";
import { assignmentService } from "@/services/assignment.service";

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

describe("Assignment Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("lists assignments", async () => {
        const mockDocuments = [{ $id: "a1", teacher: { $id: "t1" } }];
        (databases.listDocuments as jest.Mock).mockResolvedValue({
            documents: mockDocuments,
            total: 1,
        });

        const res = await assignmentService.list("inst1");

        expect(databases.listDocuments).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.TEACHER_ASSIGNMENTS,
            expect.arrayContaining([
                expect.objectContaining({ method: "equal", attr: "institution", val: "inst1" }),
                expect.objectContaining({ method: "select" })
            ])
        );
        expect(res.documents).toEqual(mockDocuments);
    });

    it("lists assignments by teacher", async () => {
        const mockDocuments = [{ $id: "a1", teacher: { $id: "t1" } }];
        (databases.listDocuments as jest.Mock).mockResolvedValue({
            documents: mockDocuments,
            total: 1,
        });

        const res = await assignmentService.listByTeacher("inst1", "t1");

        expect(databases.listDocuments).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.TEACHER_ASSIGNMENTS,
            expect.arrayContaining([
                expect.objectContaining({ method: "equal", attr: "institution", val: "inst1" }),
                expect.objectContaining({ method: "equal", attr: "teacher", val: "t1" })
            ])
        );
        expect(res.documents).toEqual(mockDocuments);
    });

    it("lists assignments by class", async () => {
        const mockDocuments = [{ $id: "a1", class: { $id: "c1" } }];
        (databases.listDocuments as jest.Mock).mockResolvedValue({
            documents: mockDocuments,
            total: 1,
        });

        const res = await assignmentService.listByClass("inst1", "c1");

        expect(databases.listDocuments).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.TEACHER_ASSIGNMENTS,
            expect.arrayContaining([
                expect.objectContaining({ method: "equal", attr: "institution", val: "inst1" }),
                expect.objectContaining({ method: "equal", attr: "class", val: "c1" })
            ])
        );
        expect(res.documents).toEqual(mockDocuments);
    });

    it("gets an assignment", async () => {
        const mockDoc = { $id: "a1", teacher: { $id: "t1" } };
        (databases.getDocument as jest.Mock).mockResolvedValue(mockDoc);

        const res = await assignmentService.get("a1");

        expect(databases.getDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.TEACHER_ASSIGNMENTS,
            "a1",
            undefined
        );
        expect(res).toEqual(mockDoc);
    });

    it("creates an assignment", async () => {
        const payload = { teacher: "t1", subject: "s1", class: "c1", institution: "inst1" };

        // Mock no existing assignments
        (databases.listDocuments as jest.Mock).mockResolvedValue({
            documents: [],
            total: 0,
        });

        (databases.createDocument as jest.Mock).mockResolvedValue({
            ...payload,
            $id: "new_id",
        });

        const res = await assignmentService.create(payload as any);

        expect(databases.createDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.TEACHER_ASSIGNMENTS,
            expect.anything(),
            payload,
            undefined
        );
        expect(res.$id).toBe("new_id");
    });

    it("throws error when creating duplicate assignment", async () => {
        const payload = { teacher: "t1", subject: "s1", class: "c1", institution: "inst1" };

        // Mock existing assignment found
        (databases.listDocuments as jest.Mock).mockResolvedValue({
            documents: [{ $id: "existing_id" }],
            total: 1,
        });

        await expect(assignmentService.create(payload as any))
            .rejects
            .toThrow("This teacher is already assigned to this subject for this class.");

        expect(databases.listDocuments).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.TEACHER_ASSIGNMENTS,
            expect.arrayContaining([
                expect.objectContaining({ method: "equal", attr: "institution", val: "inst1" }),
                expect.objectContaining({ method: "equal", attr: "class", val: "c1" }),
                expect.objectContaining({ method: "equal", attr: "subject", val: "s1" }),
                expect.objectContaining({ method: "equal", attr: "teacher", val: "t1" }),
            ])
        );
        expect(databases.createDocument).not.toHaveBeenCalled();
    });

    it("updates an assignment", async () => {
        const payload = { subject: "s2" };
        (databases.updateDocument as jest.Mock).mockResolvedValue({
            $id: "a1",
            ...payload,
        });

        const res = await assignmentService.update("a1", payload);

        expect(databases.updateDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.TEACHER_ASSIGNMENTS,
            "a1",
            payload
        );
        expect(res.subject).toBe(payload.subject);
    });

    it("deletes an assignment", async () => {
        (databases.deleteDocument as jest.Mock).mockResolvedValue({});

        await assignmentService.delete("a1");

        expect(databases.deleteDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.TEACHER_ASSIGNMENTS,
            "a1"
        );
    });
});
