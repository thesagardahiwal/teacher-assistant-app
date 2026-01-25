import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ModeSwitcher({
    mode,
    setMode,
    isDark,
}: {
    mode: "manual" | "bulk";
    setMode: (mode: "manual" | "bulk") => void;
    isDark: boolean;
}) {
    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <TouchableOpacity
                onPress={() => setMode("manual")}
                style={[
                    styles.button,
                    mode === "manual" && (isDark ? styles.activeDark : styles.active),
                ]}
            >
                <Text
                    style={[
                        styles.text,
                        mode === "manual"
                            ? isDark
                                ? styles.textActiveDark
                                : styles.textActive
                            : styles.textInactive,
                    ]}
                >
                    Manual Entry
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => setMode("bulk")}
                style={[
                    styles.button,
                    mode === "bulk" && (isDark ? styles.activeDark : styles.active),
                ]}
            >
                <Text
                    style={[
                        styles.text,
                        mode === "bulk"
                            ? isDark
                                ? styles.textActiveDark
                                : styles.textActive
                            : styles.textInactive,
                    ]}
                >
                    Bulk Upload
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        marginBottom: 24,
        padding: 4,
        borderRadius: 12,
        backgroundColor: "#E5E7EB",
    },
    containerDark: {
        backgroundColor: "#1F2937",
    },
    button: {
        flex: 1,
        paddingVertical: 8,
        alignItems: "center",
        borderRadius: 8,
    },
    active: {
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    activeDark: {
        backgroundColor: "#374151",
    },
    text: {
        fontWeight: "600",
    },
    textActive: {
        color: "#111827",
    },
    textActiveDark: {
        color: "#FFFFFF",
    },
    textInactive: {
        color: "#6B7280",
    },
});
