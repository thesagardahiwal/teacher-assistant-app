import * as FileSystem from 'expo-file-system/legacy';

const VAULT_DIR = FileSystem.documentDirectory + 'study_vault/';

export const localFileService = {
    /**
     * Ensures the study_vault directory exists.
     */
    async ensureDirectory() {
        const dirInfo = await FileSystem.getInfoAsync(VAULT_DIR);
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(VAULT_DIR, { intermediates: true });
        }
    },

    /**
     * Copies a file from cache/external URI to the secure vault.
     * @param sourceUri Path of the file to copy
     * @param fileName Desired file name (must be unique or handled)
     * @returns Relative path inside study_vault
     */
    async saveFile(sourceUri: string, fileName: string): Promise<string> {
        await this.ensureDirectory();

        // Create a unique filename to prevent collisions, or use uuid
        // format: timestamp_filename
        const uniqueName = `${Date.now()}_${fileName.replace(/\s+/g, '_')}`;
        const destinationUri = VAULT_DIR + uniqueName;

        await FileSystem.copyAsync({
            from: sourceUri,
            to: destinationUri
        });

        return `study_vault/${uniqueName}`;
    },

    /**
     * Deletes a file from the vault.
     * @param relativePath Relative path (e.g., study_vault/xyz.pdf)
     */
    async deleteFile(relativePath: string) {
        const uri = FileSystem.documentDirectory + relativePath;
        await FileSystem.deleteAsync(uri, { idempotent: true });
    },

    /**
     * Returns the full absolute URI for viewing/sharing.
     */
    /**
     * Returns the full absolute URI for viewing/sharing.
     */
    getAbsolutePath(relativePath: string) {
        return FileSystem.documentDirectory + relativePath;
    },

    /**
     * Renames a file physically.
     * Handles collisions by appending (N).
     * @returns New relative path
     */
    async renameFile(oldRelativePath: string, newFileName: string): Promise<string> {
        const oldUri = FileSystem.documentDirectory + oldRelativePath;

        // Ensure extension is preserved or added? 
        // Logic: newFileName should come with extension from UI validation.

        let targetName = newFileName;
        let targetUri = VAULT_DIR + targetName;
        let attempt = 1;

        // Check for collision
        while ((await FileSystem.getInfoAsync(targetUri)).exists) {
            // Split name and extension
            const lastDot = newFileName.lastIndexOf('.');
            if (lastDot !== -1) {
                const name = newFileName.substring(0, lastDot);
                const ext = newFileName.substring(lastDot);
                targetName = `${name}(${attempt})${ext}`;
            } else {
                targetName = `${newFileName}(${attempt})`;
            }
            targetUri = VAULT_DIR + targetName;
            attempt++;
        }

        await FileSystem.moveAsync({
            from: oldUri,
            to: targetUri
        });

        return `study_vault/${targetName}`;
    }
};
