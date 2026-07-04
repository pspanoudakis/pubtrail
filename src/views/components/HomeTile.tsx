import { ReactElement, ReactNode } from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { COLORS } from "@/styles/theme";

export type HomeTileProps = {
    label: string;
    icon: ReactNode;
    onPress: () => void;
};

export function HomeTile({ label, icon, onPress }: HomeTileProps): ReactElement {
    return (
        <Pressable onPress={onPress} style={styles.homeTile}>
            <View style={styles.homeTileIcon}>{icon}</View>
            <Text style={styles.homeTileLabel}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    homeTile: {
        width: "100%",
        minHeight: 60,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surface,
        paddingHorizontal: 12,
        paddingVertical: 12,
        justifyContent: "space-between",
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 2,
    },
    homeTileIcon: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    homeTileLabel: {
        fontSize: 15,
        fontWeight: "700",
        textAlign: "center",
        color: COLORS.textPrimary,
        paddingTop: 8,
    },
});
