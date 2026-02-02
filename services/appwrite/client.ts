import { Env } from "@/constants/env";
import { Account, Client, Databases, Storage } from "react-native-appwrite";

const client = new Client();

client
  .setEndpoint(Env.APPWRITE.ENDPOINT)
  .setProject(Env.APPWRITE.PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export default client;
