import { UserRole } from "@/types/role.type";

export const getVaultRouteForRole = (role?: UserRole) => {
    if (role === "ADMIN") return "/(admin)/study-vault";
    if (role === "STUDENT") return "/(student)/study-vault";
    return "/(teacher)/study-vault";
};
