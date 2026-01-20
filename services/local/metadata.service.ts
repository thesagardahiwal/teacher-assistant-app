import { StudyFile } from '@/types/study-file.type';
import AsyncStorage from '@react-native-async-storage/async-storage';

const METADATA_KEY = 'study_vault_metadata';

export const metadataService = {
    async getAll(): Promise<StudyFile[]> {
        try {
            const json = await AsyncStorage.getItem(METADATA_KEY);
            return json ? JSON.parse(json) : [];
        } catch (e) {
            console.error("Failed to load metadata", e);
            return [];
        }
    },

    async addFile(file: StudyFile): Promise<void> {
        const files = await this.getAll();
        files.unshift(file); // Add to top
        await AsyncStorage.setItem(METADATA_KEY, JSON.stringify(files));
    },

    async deleteFile(id: string): Promise<void> {
        const files = await this.getAll();
        const newFiles = files.filter(f => f.id !== id);
        await AsyncStorage.setItem(METADATA_KEY, JSON.stringify(newFiles));
    },

    async updateTags(id: string, tags: string[]): Promise<void> {
        const files = await this.getAll();
        const index = files.findIndex(f => f.id === id);
        if (index !== -1) {
            files[index].tags = tags;
            await AsyncStorage.setItem(METADATA_KEY, JSON.stringify(files));
        }
    },

    async updateFileName(id: string, newFileName: string, newLocalPath: string): Promise<void> {
        const files = await this.getAll();
        const index = files.findIndex(f => f.id === id);
        if (index !== -1) {
            files[index].fileName = newFileName;
            files[index].localPath = newLocalPath;
            await AsyncStorage.setItem(METADATA_KEY, JSON.stringify(files));
        }
    }
};
