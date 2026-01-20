import { databases } from "@/services/appwrite/client";
import { COLLECTIONS } from "@/services/appwrite/collections";
import { assessmentService } from "@/services/assessment.service";

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

describe("Assessment Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("creates an assessment", async () => {
        const payload = {
            title: "Math Test",
            totalMarks: 100,
            date: "2024-01-01",
            class: "c1",
            subject: "s1",
            teacher: "t1",
            institution: "i1",
        };

        (databases.createDocument as jest.Mock).mockResolvedValue({
            $id: "a1",
            ...payload
        });

        const res = await assessmentService.create(payload as any);

        expect(databases.createDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.ASSESSMENTS,
            expect.anything(),
            payload,
            undefined // Permissions argument
        );
        expect(res.$id).toBe("a1");
    });

    it("lists assessments by teacher", async () => {
        const mockDocs = [{ $id: "a1" }];
        (databases.listDocuments as jest.Mock).mockResolvedValue({
            documents: mockDocs
        });

        const res = await assessmentService.listByTeacher("inst1", "t1");

        expect(databases.listDocuments).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.ASSESSMENTS,
            expect.arrayContaining([
                expect.objectContaining({ method: "equal", attr: "institution", val: "inst1" }),
                expect.objectContaining({ method: "equal", attr: "teacher", val: "t1" }),
                expect.objectContaining({ method: "equal", attr: "isActive", val: true }),
                expect.objectContaining({ method: "select" })
            ])
        );
        expect(res.documents).toEqual(mockDocs);
    });

    it("lists assessments by class", async () => {
        const mockDocs = [{ $id: "a1" }];
        (databases.listDocuments as jest.Mock).mockResolvedValue({
            documents: mockDocs
        });

        const res = await assessmentService.listByClass("inst1", "c1", "s1");

        expect(databases.listDocuments).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.ASSESSMENTS,
            expect.arrayContaining([
                expect.objectContaining({ method: "equal", attr: "institution", val: "inst1" }),
                expect.objectContaining({ method: "equal", attr: "class", val: "c1" }),
                expect.objectContaining({ method: "equal", attr: "isActive", val: true }),
                expect.objectContaining({ method: "select" }),
                expect.objectContaining({ method: "equal", attr: "subject", val: "s1" })
            ])
        );
        expect(res.documents).toEqual(mockDocs);
    });
});
