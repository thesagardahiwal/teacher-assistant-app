import { databases } from "@/services/appwrite/client";
import { scheduleService } from "@/services/schedule.service";

describe("Schedule Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("creates a schedule", async () => {
        (databases.createDocument as jest.Mock).mockResolvedValue({
            $id: "schedule1",
        });

        const res = await scheduleService.create({
            teacher: "t1",
            class: "c1",
            subject: "s1",
            academicYear: "ay1",
            dayOfWeek: "MON",
            startTime: "09:00",
            endTime: "10:00",
            institution: "i1",
            isActive: true,
        });

        expect(databases.createDocument).toHaveBeenCalled();
        expect(res.$id).toBe("schedule1");
    });

    it("fetches next class for teacher", async () => {
        (databases.listDocuments as jest.Mock).mockResolvedValue({
            documents: [{ $id: "schedule2" }],
        });

        const res = await scheduleService.getNextClassForTeacher(
            "teacher1",
            "MON",
            "08:00"
        );

        expect(res.documents.length).toBe(1);
    });
    it("updates a schedule and sanitizes payload", async () => {
        const payloadWithObjects = {
            class: { $id: "c1", name: "Class 1" },
            subject: [{ $id: "s1", name: "Subject 1" }], // Array case
            teacher: "t1", // String case
        };

        (databases.updateDocument as jest.Mock).mockResolvedValue({
            $id: "schedule1",
            class: "c1",
            subject: "s1",
            teacher: "t1",
        });

        await scheduleService.update("schedule1", payloadWithObjects as any);

        expect(databases.updateDocument).toHaveBeenCalledWith(
            expect.anything(), // databaseId
            expect.anything(), // collectionId
            "schedule1",
            expect.objectContaining({
                class: "c1",
                subject: "s1",
                teacher: "t1",
            })
        );
    });
});
