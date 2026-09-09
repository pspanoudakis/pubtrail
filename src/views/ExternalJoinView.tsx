import React from "react";
import { Text, View, Pressable, StyleSheet } from "react-native";
import { createThemedStyles } from "@/styles/createThemedStyles";

export interface ExternalJoinViewProps {
    code: string;
    onOpen: () => void;
    onJoinBrowser: () => void;
}

export function ExternalJoinView({ code, onOpen, onJoinBrowser }: ExternalJoinViewProps) {
    const styles = useStyles();
    return (
        <View style={styles.container}>
            <Text style={styles.label}>Joining Crawl with Code:</Text>
            <Text style={styles.code}>{code}</Text>

            <Pressable onPress={onOpen} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
                <Text style={styles.buttonText}>Open in app</Text>
            </Pressable>

            <Pressable onPress={onJoinBrowser} style={({ pressed }) => [styles.buttonSecondary, pressed && styles.buttonSecondaryPressed]}>
                <Text style={styles.buttonSecondaryText}>Join in browser</Text>
            </Pressable>
        </View>
    );
}

const useStyles = createThemedStyles(({ COLORS, SPACING, TYPOGRAPHY, RADIUS }) => StyleSheet.create({
    container: { padding: SPACING.md, alignItems: "center" },
    label: { fontSize: TYPOGRAPHY.sizes.body, marginBottom: SPACING.sm },
    code: { fontWeight: TYPOGRAPHY.weights.semibold, marginBottom: SPACING.md },
    button: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.md,
        marginBottom: SPACING.sm,
    },
    buttonPressed: {
        opacity: 0.8,
    },
    buttonText: { color: COLORS.surface, fontWeight: TYPOGRAPHY.weights.semibold },
    buttonSecondary: {
        backgroundColor: COLORS.primarySubtle,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.md,
    },
    buttonSecondaryPressed: {
        opacity: 0.7,
    },
    buttonSecondaryText: { color: COLORS.primary, fontWeight: TYPOGRAPHY.weights.semibold },
}));

