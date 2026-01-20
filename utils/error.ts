import { AppwriteException } from "react-native-appwrite";

export const handleServiceError = (error: any, context: string): never => {
    console.error(`Error in ${context}:`, error);

    if (error instanceof AppwriteException) {
        if (error.code === 409 || error.message?.includes('already exists')) {
            throw new Error(`${context} failed: Resource already exists.`);
        }
        if (error.code === 401) {
            throw new Error("Unauthorized access. Please login again.");
        }
        if (error.code === 404) {
            throw new Error(`${context} failed: Resource not found.`);
        }
        throw new Error(error.message || `${context} failed due to a server error.`);
    }

    if (error instanceof Error) {
        throw error;
    }

    throw new Error(`${context} failed: an unexpected error occurred.`);
};
