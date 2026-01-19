import { databases } from "@/services/appwrite/client";
import { COLLECTIONS } from "@/services/appwrite/collections";
import { courseService } from "@/services/course.service";

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
    },
    ID: { unique: jest.fn(() => "unique_id") },
}));

describe("Course Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("lists courses", async () => {
        const mockDocuments = [{ $id: "c1", name: "CS101" }];
        (databases.listDocuments as jest.Mock).mockResolvedValue({
            documents: mockDocuments,
            total: 1,
        });

        const res = await courseService.list("inst1");

        expect(databases.listDocuments).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.COURSES,
            expect.arrayContaining([
                expect.objectContaining({ method: "equal", attr: "institution", val: "inst1" })
            ])
        );
        expect(res.documents).toEqual(mockDocuments);
    });

    it("gets a course", async () => {
        const mockDoc = { $id: "c1", name: "CS101" };
        (databases.getDocument as jest.Mock).mockResolvedValue(mockDoc);

        const res = await courseService.get("c1");

        expect(databases.getDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.COURSES,
            "c1",
            undefined
        );
        expect(res).toEqual(mockDoc);
    });

    it("creates a course", async () => {
        const payload = {
            name: "CS101",
            code: "CS101",
            durationYears: 4,
            isActive: true,
            institution: "inst1"
        };
        (databases.createDocument as jest.Mock).mockResolvedValue({
            ...payload,
            $id: "new_id",
        });

        const res = await courseService.create(payload as any);

        expect(databases.createDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.COURSES,
            expect.anything(),
            payload,
            undefined
        );
        expect(res.$id).toBe("new_id");
    });

    it("updates a course", async () => {
        const payload = { name: "CS102" };
        (databases.updateDocument as jest.Mock).mockResolvedValue({
            $id: "c1",
            ...payload,
        });

        const res = await courseService.update("c1", payload);

        expect(databases.updateDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.COURSES,
            "c1",
            payload
        );
        expect(res.name).toBe(payload.name);
    });

    it("deletes a course", async () => {
        (databases.deleteDocument as jest.Mock).mockResolvedValue({});

        await courseService.delete("c1");

        expect(databases.deleteDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.COURSES,
            "c1"
        );
    });
});
