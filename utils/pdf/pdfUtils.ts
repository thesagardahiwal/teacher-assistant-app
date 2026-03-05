export const toSafeFileName = (value: string) =>
    value
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_-]/g, "");
