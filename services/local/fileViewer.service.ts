import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

export const fileViewerService = {
    /**
     * OPENS the file using the best available system viewer.
     * Android: Uses ACTION_VIEW intent.
     * iOS: Uses Sharing (Open In) or Linking if applicable.
     */
    async openFile(localPath: string, mimeType: string) {
        try {
            const contentUri = await FileSystem.getContentUriAsync(localPath);

            if (Platform.OS === 'android') {
                await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                    data: contentUri,
                    flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
                    type: mimeType
                });
            } else {
                // iOS: Sharing.shareAsync is the standard "Open In" / Share sheet.
                // It allows "Open in Books", "Open in Files", etc.
                // There isn't a strict "Open" only intent exposed easily in Expo without native modules/ejecting
                // that avoids the Share UI entirely, but UTI can help narrow it.
                await Sharing.shareAsync(localPath, {
                    UTI: 'public.item', // generic
                    dialogTitle: 'Open File'
                });
            }
        } catch (error) {
            console.error('Error opening file:', error);
            Alert.alert('Error', 'No app found to open this file.');
        }
    },

    /**
     * SHARES the file using the system share sheet.
     * Shows social media, drive, etc.
     */
    async shareFile(localPath: string) {
        try {
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(localPath, {
                    dialogTitle: 'Share File'
                });
            } else {
                Alert.alert('Error', 'Sharing is not available on this device');
            }
        } catch (error) {
            console.error('Error sharing file:', error);
            Alert.alert('Error', 'Failed to share file');
        }
    }
};
