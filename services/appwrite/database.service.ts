import { ID, Models } from "react-native-appwrite";
import { handleServiceError } from "../../utils/error";
import { databases } from "./client";
import { DATABASE_ID } from "./collections";

type WritableData<T> = Omit<T, keyof Models.Document>;

export const databaseService = {
  async create<T extends Models.Document>(
    collectionId: string,
    data: any,
    permissions?: string[],
    documentId?: string
  ) {
    try {
      return await databases.createDocument<T>(
        DATABASE_ID,
        collectionId,
        documentId || ID.unique(),
        data,
        permissions
      );
    } catch (error) {
      return handleServiceError(error, `Creating document in ${collectionId}`);
    }
  },

  async createUserDocument<T extends Models.Document>(
    collectionId: string,
    userId: string,
    data: any
  ) {
    try {
      return await databases.createDocument<T>(
        DATABASE_ID,
        collectionId,
        userId,
        data
      );
    } catch (error) {
      return handleServiceError(error, `Creating user document in ${collectionId}`);
    }
  },

  async get<T extends Models.Document>(
    collectionId: string,
    documentId: string,
    queries?: string[]
  ) {
    try {
      return await databases.getDocument<T>(
        DATABASE_ID,
        collectionId,
        documentId,
        queries
      );
    } catch (error) {
      return handleServiceError(error, `Getting document ${documentId} from ${collectionId}`);
    }
  },

  async list<T extends Models.Document>(
    collectionId: string,
    queries: string[] = []
  ) {
    try {
      return await databases.listDocuments<T>(
        DATABASE_ID,
        collectionId,
        queries
      );
    } catch (error) {
      return handleServiceError(error, `Listing documents from ${collectionId}`);
    }
  },

  async update<T extends Models.Document>(
    collectionId: string,
    documentId: string,
    data: Partial<WritableData<T>>
  ) {
    try {
      return await databases.updateDocument<T>(
        DATABASE_ID,
        collectionId,
        documentId,
        data as any
      );
    } catch (error) {
      return handleServiceError(error, `Updating document ${documentId} in ${collectionId}`);
    }
  },

  async delete(collectionId: string, documentId: string) {
    try {
      return await databases.deleteDocument(
        DATABASE_ID,
        collectionId,
        documentId
      );
    } catch (error) {
      return handleServiceError(error, `Deleting document ${documentId} from ${collectionId}`);
    }
  },
};
