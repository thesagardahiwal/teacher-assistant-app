import { Alert, Platform } from "react-native";

interface AlertButton {
    text?: string;
    onPress?: (value?: string) => void | Promise<void>;
    style?: "default" | "cancel" | "destructive";
}

interface AlertOptions {
    cancelable?: boolean;
    onDismiss?: () => void;
}

export const showAlert = (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions
) => {
    if (Platform.OS === "web") {
        const confirmMessage = message ? `${title}\n\n${message}` : title;

        // If no buttons provided, simplistic alert
        if (!buttons || buttons.length === 0) {
            window.alert(confirmMessage);
            return;
        }

        // Find cancel and confirm/destructive buttons
        const cancelButton = buttons.find(b => b.style === "cancel");
        const confirmButton = buttons.find(b => b.style !== "cancel");

        // Simple confirm dialog logic
        // If there is a confirm button, we use confirm()
        if (confirmButton) {
            const result = window.confirm(confirmMessage);
            if (result) {
                confirmButton.onPress?.();
            } else {
                cancelButton?.onPress?.();
            }
        } else {
            // Only cancel or default buttons? Just show alert if it's info only
            window.alert(confirmMessage);
            // If there's a default button (OK), trigger it
            const defaultButton = buttons.find(b => b.style === "default" || !b.style);
            defaultButton?.onPress?.();
        }

    } else {
        Alert.alert(title, message, buttons, options);
    }
};
