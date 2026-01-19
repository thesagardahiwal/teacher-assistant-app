import { databases } from "@/services/appwrite/client";
import { COLLECTIONS } from "@/services/appwrite/collections";
import { teacherService } from "@/services/teacher.service";

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

describe("Teacher Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("lists teachers", async () => {
        const mockDocuments = [{ $id: "t1", name: "Teacher A", role: "TEACHER" }];
        (databases.listDocuments as jest.Mock).mockResolvedValue({
            documents: mockDocuments,
            total: 1,
        });

        const res = await teacherService.list("inst1");

        expect(databases.listDocuments).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.USERS,
            expect.arrayContaining([
                expect.objectContaining({ method: "equal", attr: "institution", val: "inst1" }),
                expect.objectContaining({ method: "equal", attr: "role", val: "TEACHER" })
            ])
        );
        expect(res.documents).toEqual(mockDocuments);
    });

    it("gets a teacher", async () => {
        const mockDoc = { $id: "t1", name: "Teacher A" };
        (databases.getDocument as jest.Mock).mockResolvedValue(mockDoc);

        const res = await teacherService.get("t1");

        expect(databases.getDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.USERS,
            "t1",
            undefined
        );
        expect(res).toEqual(mockDoc);
    });

    it("updates a teacher", async () => {
        const payload = { hasCompletedSetup: true };
        (databases.updateDocument as jest.Mock).mockResolvedValue({
            $id: "t1",
            ...payload,
        });

        // @ts-ignore
        const res = await teacherService.update("t1", payload);

        expect(databases.updateDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.USERS,
            "t1",
            payload
        );
    });
});
