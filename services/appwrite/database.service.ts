import { ID, Models } from "react-native-appwrite";
import { databases } from "./client";
import { DATABASE_ID } from "./collections";

type WritableData<T> = Omit<T, keyof Models.Document>;

export const databaseService = {
  create<T extends Models.Document>(
    collectionId: string,
    data: any,
    permissions?: string[]
  ) {
    return databases.createDocument<T>(
      DATABASE_ID,
      collectionId,
      ID.unique(),
      data,
      permissions
    );
  },

  get<T extends Models.Document>(
    collectionId: string,
    documentId: string,
    queries?: string[]
  ) {
    return databases.getDocument<T>(
      DATABASE_ID,
      collectionId,
      documentId,
      queries
    );
  },

  list<T extends Models.Document>(
    collectionId: string,
    queries: string[] = []
  ) {
    return databases.listDocuments<T>(
      DATABASE_ID,
      collectionId,
      queries
    );
  },

  update<T extends Models.Document>(
    collectionId: string,
    documentId: string,
    data: Partial<WritableData<T>>
  ) {
    return databases.updateDocument<T>(
      DATABASE_ID,
      collectionId,
      documentId,
      data as any
    );
  },

  delete(collectionId: string, documentId: string) {
    return databases.deleteDocument(
      DATABASE_ID,
      collectionId,
      documentId
    );
  },
};
