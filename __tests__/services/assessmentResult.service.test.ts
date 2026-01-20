import { databases } from "@/services/appwrite/client";
import { COLLECTIONS } from "@/services/appwrite/collections";
import { assessmentResultService } from "@/services/assessmentResult.service";

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

describe("Assessment Result Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("upserts a result (create)", async () => {
        (databases.createDocument as jest.Mock).mockResolvedValue({ $id: "res1" });

        const payload = {
            assessment: "a1",
            student: "s1",
            marksObtained: 80,
            institution: "i1",
            remarks: "Good"
        };

        const res = await assessmentResultService.upsert(payload as any);

        expect(databases.createDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.ASSESSMENT_RESULTS,
            expect.anything(),
            expect.objectContaining(payload),
            undefined // Permissions argument
        );
        expect(res.$id).toBe("res1");
    });

    it("lists results by assessment", async () => {
        const mockDocs = [{ $id: "res1" }];
        (databases.listDocuments as jest.Mock).mockResolvedValue({
            documents: mockDocs
        });

        const res = await assessmentResultService.listByAssessment("inst1", "a1");

        expect(databases.listDocuments).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.ASSESSMENT_RESULTS,
            expect.arrayContaining([
                expect.objectContaining({ method: "equal", attr: "institution", val: "inst1" }),
                expect.objectContaining({ method: "equal", attr: "assessment", val: "a1" }),
                expect.objectContaining({ method: "select" })
            ])
        );
        expect(res.documents).toEqual(mockDocs);
    });

    it("lists results by student", async () => {
        const mockDocs = [{ $id: "res1" }];
        (databases.listDocuments as jest.Mock).mockResolvedValue({
            documents: mockDocs
        });

        const res = await assessmentResultService.listByStudent("inst1", "s1");

        expect(databases.listDocuments).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.ASSESSMENT_RESULTS,
            expect.arrayContaining([
                expect.objectContaining({ method: "equal", attr: "institution", val: "inst1" }),
                expect.objectContaining({ method: "equal", attr: "student", val: "s1" }),
                expect.objectContaining({ method: "select" })
            ])
        );
        expect(res.documents).toEqual(mockDocs);
    });
});
