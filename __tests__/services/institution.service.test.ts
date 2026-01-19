import { databases } from "@/services/appwrite/client";
import { COLLECTIONS } from "@/services/appwrite/collections";
import { institutionService } from "@/services/institution.service";

jest.mock("@/services/appwrite/client", () => ({
    databases: {
        getDocument: jest.fn(),
        updateDocument: jest.fn(),
    },
}));

describe("Institution Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("gets an institution", async () => {
        const mockDoc = { $id: "inst1", name: "University" };
        (databases.getDocument as jest.Mock).mockResolvedValue(mockDoc);

        const res = await institutionService.get("inst1");

        expect(databases.getDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.INSTITUTIONS,
            "inst1",
            undefined
        );
        expect(res).toEqual(mockDoc);
    });

    it("updates an institution", async () => {
        const payload = { name: "University Updated" };
        (databases.updateDocument as jest.Mock).mockResolvedValue({
            $id: "inst1",
            ...payload,
        });

        const res = await institutionService.update("inst1", payload);

        expect(databases.updateDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.INSTITUTIONS,
            "inst1",
            payload
        );
        expect(res.name).toBe(payload.name);
    });
});
