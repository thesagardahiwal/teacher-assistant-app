export const Env = {
    APPWRITE: {
        PROJECT_ID: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "",
        PROJECT_NAME: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_NAME || "Techora",
        ENDPOINT: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
        DATABASE_ID: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || "",
    },
    GEMINI: {
        API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY || "",
    }
};
