import { databases } from "@/services/appwrite/client";
import { COLLECTIONS } from "@/services/appwrite/collections";
import { studentService } from "@/services/student.service";

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

describe("Student Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("lists students", async () => {
        const mockDocuments = [{ $id: "s1", name: "John Doe" }];
        (databases.listDocuments as jest.Mock).mockResolvedValue({
            documents: mockDocuments,
            total: 1,
        });

        const res = await studentService.list("inst1");

        expect(databases.listDocuments).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.STUDENTS,
            expect.arrayContaining([
                expect.objectContaining({ method: "equal", attr: "institution", val: "inst1" }),
                expect.objectContaining({ method: "select" })
            ])
        );
        expect(res.documents).toEqual(mockDocuments);
    });

    it("lists students by classes", async () => {
        const mockDocuments = [{ $id: "s1", name: "John Doe", class: { $id: "c1" } }];
        (databases.listDocuments as jest.Mock).mockResolvedValue({
            documents: mockDocuments,
            total: 1,
        });

        const res = await studentService.listByClasses("inst1", ["c1"]);

        expect(databases.listDocuments).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.STUDENTS,
            expect.arrayContaining([
                expect.objectContaining({ method: "equal", attr: "institution", val: "inst1" }),
                expect.objectContaining({ method: "equal", attr: "class", val: ["c1"] }),
                expect.objectContaining({ method: "select" })
            ])
        );
        expect(res.documents).toEqual(mockDocuments);
    });

    it("returns empty list if no classes provided", async () => {
        const res = await studentService.listByClasses("inst1", []);
        expect(res.total).toBe(0);
        expect(databases.listDocuments).not.toHaveBeenCalled();
    });

    it("gets a student", async () => {
        const mockDoc = { $id: "s1", name: "John Doe" };
        (databases.getDocument as jest.Mock).mockResolvedValue(mockDoc);

        const res = await studentService.get("s1");

        expect(databases.getDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.STUDENTS,
            "s1",
            expect.arrayContaining([expect.objectContaining({ method: "select" })])
        );
        expect(res).toEqual(mockDoc);
    });

    it("creates a student", async () => {
        const payload = {
            name: "John Doe",
            rollNumber: "123",
            email: "john@example.com",
            course: "course1",
            class: "c1",
            institution: "inst1",
            phone: '123'
        };

        const mockInvitation = { token: "abc", $id: "inv1" };
        const mockStudent = { ...payload, $id: "new_id", userId: "invite:abc" };

        jest.spyOn(require("@/services/invitation.service").invitationService, "createInvite")
            .mockResolvedValue(mockInvitation);

        (databases.createDocument as jest.Mock).mockResolvedValue(mockStudent);

        const res = await studentService.create(payload as any);

        expect(databases.createDocument).toHaveBeenCalled();
        expect(res.student.$id).toBe("new_id");
        expect(res.invitation.token).toBe("abc");
    });

    it("updates a student", async () => {
        const payload = { name: "Jane Doe" };
        (databases.updateDocument as jest.Mock).mockResolvedValue({
            $id: "s1",
            ...payload,
        });

        const res = await studentService.update("s1", payload);

        expect(databases.updateDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.STUDENTS,
            "s1",
            payload
        );
        expect(res.name).toBe(payload.name);
    });

    it("deletes a student", async () => {
        (databases.deleteDocument as jest.Mock).mockResolvedValue({});

        await studentService.delete("s1");

        expect(databases.deleteDocument).toHaveBeenCalledWith(
            expect.anything(),
            COLLECTIONS.STUDENTS,
            "s1"
        );
    });
});
