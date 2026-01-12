import { Models } from "react-native-appwrite";

export interface Institution extends Models.Document {
    $id: string;
    name: string;
    code: string;
    isActive: boolean;
}