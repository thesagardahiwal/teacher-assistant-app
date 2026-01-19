import { databases } from "@/services/appwrite/client";
import { COLLECTIONS } from "@/services/appwrite/collections";
import { userService } from "@/services/user.service";

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

describe("User Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("lists users", async () => {
        const mockDocuments = [{ $id: "u1", name: "User A" }];
        (databases.listDocuments as jest.Mock).mockResolvedValue({
            documents: mockDocuments,
            total: 1,
        });

        const res = await userService.list("inst1");

        expect(databases.listDocuments).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.USERS,
            expect.arrayContaining([
                expect.objectContaining({ method: "equal", attr: "institution", val: "inst1" }),
                expect.objectContaining({ method: "select" })
            ])
        );
        expect(res.documents).toEqual(mockDocuments);
    });

    it("gets a user", async () => {
        const mockDoc = { $id: "u1", name: "User A" };
        (databases.getDocument as jest.Mock).mockResolvedValue(mockDoc);

        const res = await userService.get("u1");

        expect(databases.getDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.USERS,
            "u1",
            expect.arrayContaining([expect.objectContaining({ method: "select" })])
        );
        expect(res).toEqual(mockDoc);
    });

    it("updates a user", async () => {
        const payload = { name: "User A Updated" };
        (databases.updateDocument as jest.Mock).mockResolvedValue({
            $id: "u1",
            ...payload,
        });

        const res = await userService.update("u1", payload);

        expect(databases.updateDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.USERS,
            "u1",
            payload
        );
        expect(res.name).toBe(payload.name);
    });

    it("deletes a user", async () => {
        (databases.deleteDocument as jest.Mock).mockResolvedValue({});

        await userService.delete("u1");

        expect(databases.deleteDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.USERS,
            "u1"
        );
    });
});
