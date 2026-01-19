import { academicYearService } from "@/services/academicYear.service";
import { databases } from "@/services/appwrite/client";
import { COLLECTIONS } from "@/services/appwrite/collections";

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

describe("Academic Year Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("lists academic years", async () => {
        const mockDocuments = [{ $id: "ay1", label: "2023-2024", isCurrent: true }];
        (databases.listDocuments as jest.Mock).mockResolvedValue({
            documents: mockDocuments,
            total: 1,
        });

        const res = await academicYearService.list("inst1");

        expect(databases.listDocuments).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.ACADEMIC_YEARS,
            expect.arrayContaining([
                expect.objectContaining({ method: "equal", attr: "institution", val: "inst1" }),
                expect.objectContaining({ method: "select" })
            ])
        );
        expect(res.documents).toEqual(mockDocuments);
    });

    it("gets an academic year", async () => {
        const mockDoc = { $id: "ay1", label: "2023-2024", isCurrent: true };
        (databases.getDocument as jest.Mock).mockResolvedValue(mockDoc);

        const res = await academicYearService.get("ay1");

        expect(databases.getDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.ACADEMIC_YEARS,
            "ay1",
            expect.arrayContaining([expect.objectContaining({ method: "select" })])
        );
        expect(res).toEqual(mockDoc);
    });

    it("creates an academic year", async () => {
        const payload = { label: "2024-2025", isCurrent: false, institution: "inst1" };
        (databases.createDocument as jest.Mock).mockResolvedValue({
            ...payload,
            $id: "new_id",
        });

        const res = await academicYearService.create(payload as any);

        expect(databases.createDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.ACADEMIC_YEARS,
            expect.anything(),
            payload,
            undefined
        );
        expect(res.$id).toBe("new_id");
    });

    it("updates an academic year", async () => {
        const payload = { label: "2024-2025 Revised" };
        (databases.updateDocument as jest.Mock).mockResolvedValue({
            $id: "ay1",
            ...payload,
        });

        const res = await academicYearService.update("ay1", payload);

        expect(databases.updateDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.ACADEMIC_YEARS,
            "ay1",
            payload
        );
        expect(res.label).toBe(payload.label);
    });

    it("deletes an academic year", async () => {
        (databases.deleteDocument as jest.Mock).mockResolvedValue({});

        await academicYearService.delete("ay1");

        expect(databases.deleteDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.ACADEMIC_YEARS,
            "ay1"
        );
    });
});
