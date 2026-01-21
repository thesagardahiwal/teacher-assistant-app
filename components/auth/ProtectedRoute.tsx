import { Redirect, usePathname, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../../store/hooks/useAuth";
import { UserRole } from "../../types/role.type";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && user) {
            if (!allowedRoles.includes(user.role)) {
                // Redirect to appropriate dashboard based on role
                if (user.role === "STUDENT") {
                    router.replace("/(student)/dashboard");
                } else if (user.role === "TEACHER") {
                    router.replace("/(teacher)");
                } else if (["ADMIN"].includes(user.role)) {
                    router.replace("/(admin)/dashboard");
                } else if (["PRINCIPAL", "VICE_PRINCIPAL"].includes(user.role)) {
                    router.replace("/(principal)/dashboard");
                }
            }
        }
    }, [user, isLoading, allowedRoles, router]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!user) {
        return <Redirect href="/(auth)/login" />;
    }

    if (!allowedRoles.includes(user.role)) {
        // Return null while redirecting to avoid flashing unauthorized content
        return null;
    }

    return <>{children}</>;
}
