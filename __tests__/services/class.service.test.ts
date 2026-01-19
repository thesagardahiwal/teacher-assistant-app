import { databases } from "@/services/appwrite/client";
import { COLLECTIONS } from "@/services/appwrite/collections";
import { classService } from "@/services/class.service";

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

describe("Class Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("lists classes", async () => {
        const mockDocuments = [{ $id: "c1", name: "Class A" }];
        (databases.listDocuments as jest.Mock).mockResolvedValue({
            documents: mockDocuments,
            total: 1,
        });

        const res = await classService.list("inst1");

        expect(databases.listDocuments).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.CLASSES,
            expect.arrayContaining([
                expect.objectContaining({ method: "equal", attr: "institution", val: "inst1" }),
                expect.objectContaining({ method: "select" })
            ])
        );
        expect(res.documents).toEqual(mockDocuments);
    });

    it("lists classes by academic year", async () => {
        const mockDocuments = [{ $id: "c1", academicYear: "ay1" }];
        (databases.listDocuments as jest.Mock).mockResolvedValue({
            documents: mockDocuments,
            total: 1,
        });

        const res = await classService.listByAcademicYear("inst1", "ay1");

        expect(databases.listDocuments).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.CLASSES,
            expect.arrayContaining([
                expect.objectContaining({ method: "equal", attr: "institution", val: "inst1" }),
                expect.objectContaining({ method: "equal", attr: "academicYear", val: "ay1" }),
                expect.objectContaining({ method: "select" })
            ])
        );
        expect(res.documents).toEqual(mockDocuments);
    });

    it("gets a class", async () => {
        const mockDoc = { $id: "c1", name: "Class A" };
        (databases.getDocument as jest.Mock).mockResolvedValue(mockDoc);

        const res = await classService.get("c1");

        expect(databases.getDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.CLASSES,
            "c1",
            expect.arrayContaining([expect.objectContaining({ method: "select" })])
        );
        expect(res).toEqual(mockDoc);
    });

    it("creates a class", async () => {
        const payload = {
            name: "Class A",
            academicYear: "ay1",
            semester: 1,
            institution: "inst1",
            course: "course1"
        };
        (databases.createDocument as jest.Mock).mockResolvedValue({
            ...payload,
            $id: "new_id",
        });

        const res = await classService.create(payload as any);

        expect(databases.createDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.CLASSES,
            expect.anything(),
            payload,
            undefined
        );
        expect(res.$id).toBe("new_id");
    });

    it("updates a class", async () => {
        const payload = { name: "Class B" };
        (databases.updateDocument as jest.Mock).mockResolvedValue({
            $id: "c1",
            ...payload,
        });

        const res = await classService.update("c1", payload);

        expect(databases.updateDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.CLASSES,
            "c1",
            payload
        );
        expect(res.name).toBe(payload.name);
    });

    it("deletes a class", async () => {
        (databases.deleteDocument as jest.Mock).mockResolvedValue({});

        await classService.delete("c1");

        expect(databases.deleteDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.CLASSES,
            "c1"
        );
    });
});
