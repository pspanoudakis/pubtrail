import { ReactElement, ReactNode } from "react";
import { Pressable, View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { COLORS } from "@/styles/theme";

export type ActionButtonProps = {
    label: string;
    onPress: () => void;
    compact?: boolean;
    icon?: ReactNode;
    loading?: boolean;
    disabled?: boolean;
    loadingLabel?: string;
};

export function ActionButton({
    label, onPress, compact, icon, loading = false, disabled = false, loadingLabel,
}: ActionButtonProps): ReactElement {
    const isDisabled = disabled || loading;
    const displayLabel = loading && loadingLabel ? loadingLabel : label;

    return (
        <Pressable
            onPress={onPress}
            disabled={isDisabled}
            style={[
                styles.actionButton,
                compact ? styles.compactButton : null,
                isDisabled ? styles.actionButtonDisabled : null,
            ]}
        >
            <View style={styles.actionContent}>
                {loading ? (
                    <ActivityIndicator size="small" color={COLORS.surface} />
                ) : icon ? (
                    <View style={styles.actionIcon}>{icon}</View>
                ) : null}
                <Text style={styles.actionLabel}>{displayLabel}</Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    actionButton: {
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 16,
        paddingVertical: 13,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.14,
        shadowRadius: 10,
        elevation: 3,
    },
    compactButton: {
        paddingVertical: 8,
    },
    actionButtonDisabled: {
        opacity: 0.65,
    },
    actionContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    actionLabel: {
        fontSize: 16,
        color: COLORS.surface,
        fontWeight: "600",
    },
    actionIcon: {
        alignItems: "center",
        justifyContent: "center",
    },
});
