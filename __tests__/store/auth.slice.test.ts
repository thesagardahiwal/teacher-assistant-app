import authReducer, {
    login,
    logout,
} from "@/store/slices/auth.slice";

describe("Auth Slice", () => {
    it("sets user on login", () => {
        const mockUser = {
            $id: "1",
            userId: "u1",
            name: "Admin",
            email: "admin@test.com",
            role: "ADMIN",
            isActive: true,
            institution: { $id: "i1" },
        };

        const action = login.fulfilled(
            mockUser as any,
            "requestId",
            { email: "test", password: "test" }
        );
        const state = authReducer(undefined, action);

        expect(state.isAuthenticated).toBe(true);
        expect(state.role).toBe("ADMIN");
    });

    it("clears state on logout", () => {
        const action = logout.fulfilled(undefined, "requestId");
        const state = authReducer(undefined, action);
        expect(state.isAuthenticated).toBe(false);
    });
});
