import { databases } from "@/services/appwrite/client";
import { COLLECTIONS } from "@/services/appwrite/collections";
import { subjectService } from "@/services/subject.service";

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

describe("Subject Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("lists subjects", async () => {
        const mockDocuments = [{ $id: "sub1", name: "Math" }];
        (databases.listDocuments as jest.Mock).mockResolvedValue({
            documents: mockDocuments,
            total: 1,
        });

        const res = await subjectService.list("inst1");

        expect(databases.listDocuments).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.SUBJECTS,
            expect.arrayContaining([
                expect.objectContaining({ method: "equal", attr: "institution", val: "inst1" }),
                expect.objectContaining({ method: "select" })
            ])
        );
        expect(res.documents).toEqual(mockDocuments);
    });

    it("gets a subject", async () => {
        const mockDoc = { $id: "sub1", name: "Math" };
        (databases.getDocument as jest.Mock).mockResolvedValue(mockDoc);

        const res = await subjectService.get("sub1");

        expect(databases.getDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.SUBJECTS,
            "sub1",
            undefined
        );
        expect(res).toEqual(mockDoc);
    });

    it("creates a subject", async () => {
        const payload = {
            name: "Math",
            code: "MTH101",
            course: "c1",
            semester: 1,
            institution: "inst1"
        };
        (databases.createDocument as jest.Mock).mockResolvedValue({
            ...payload,
            $id: "new_id",
        });

        const res = await subjectService.create(payload as any);

        expect(databases.createDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.SUBJECTS,
            expect.anything(),
            payload,
            undefined
        );
        expect(res.$id).toBe("new_id");
    });

    it("updates a subject", async () => {
        const payload = { name: "Mathematics" };
        (databases.updateDocument as jest.Mock).mockResolvedValue({
            $id: "sub1",
            ...payload,
        });

        const res = await subjectService.update("sub1", payload);

        expect(databases.updateDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.SUBJECTS,
            "sub1",
            payload
        );
        expect(res.name).toBe(payload.name);
    });

    it("deletes a subject", async () => {
        (databases.deleteDocument as jest.Mock).mockResolvedValue({});

        await subjectService.delete("sub1");

        expect(databases.deleteDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.SUBJECTS,
            "sub1"
        );
    });
});
