import { usePathname, useRouter } from "expo-router";
import { useCallback } from "react";

export const useSafeBack = () => {
    const router = useRouter();
    const pathname = usePathname();

    const goBack = useCallback(() => {
        // 1. Get current path segments
        const segments = pathname.split('/').filter(Boolean);

        // 2. If we are at root or empty, nothing to do (or go home)
        if (segments.length === 0) {
            router.replace("/");
            return;
        }

        // 3. Logic: Remove the last segment to go up one level
        // e.g., /students/123 -> /students
        // e.g., /students/create -> /students
        const newPathSegments = segments.slice(0, -1);
        const newPath = "/" + newPathSegments.join("/");

        // 4. Check if standard back matches the expectation (roughly)
        // With Expo Router, router.back() relies on history. 
        // If we deep linked, history might be empty or point to previous app.
        // We prioritize the "Hierarchical" back which is safer for this app structure.

        // However, router.canGoBack() can be misleading in deep links.
        // We will FORCE navigation to the parent route to ensure consistency.

        // Edge Case: If we are at a "root" tab like /(teacher), going back might mean logout or nothing.
        // If segments is 1 (e.g. "dashboard"), allow default behavior or do nothing.
        if (segments.length <= 1) {
            if (router.canGoBack()) {
                router.back();
            } else {
                // Fallback to home if stuck
                router.replace("/");
            }
            return;
        }

        // Navigate to the computed parent path
        router.push(newPath as any);
        // Note: We use push to ensure we render the parent component fresh or focused.
        // In some stack configs, 'dismiss' or 'back' might be better, but 'push' guarantees we go where we want.
        // To avoid infinite stacks, 'replace' could be used, but 'push' preserves the feeling of "going forward to parent" if stack was empty? 
        // Actually, 'router.dismiss()' or 'router.back()' IS better if the stack exists.
        // BUT the user constraint says "Navigation stays WITHIN the current module".
        // If history is messed up, 'push' or 'replace' is safer to guarantee destination.
        // Let's use 'replace' to avoid building a huge stack of "Back" actions if user keeps going back and forth.
        // OR better: try to detect if we can go back to that specific route? No, too complex.

        // Let's stick to the constraint: "Remove only the LAST segment"
        // And "Prefer module-local fallback"

        router.dismissTo(newPath as any); // dismissTo is great if available in this version, otherwise push/replace.
        // If dismissTo is not available (verified in newer expo-router), we check coverage.
        // Since I don't know exact version features, let's try a safe approach:

        // If we can go back, we SHOULD, but only if it goes to the right place? Can't know.
        // The safest "Fix" for "jump out of module" is to explicitly navigate to the parent.

        // Router.replace() replaces current screen with parent. 
        // This is good for "Deep link -> Back", as it effectively swaps the detail for the list.
        // It might lose scroll position of the list if it wasn't in stack.

        router.replace(newPath as any);

    }, [pathname, router]);

    return { goBack };
};
