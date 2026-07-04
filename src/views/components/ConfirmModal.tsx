import { ReactElement } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/styles/theme";

type ConfirmModalProps = {
    visible: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isConfirmLoading?: boolean;
    confirmDisabled?: boolean;
    destructive?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export function ConfirmModal({
    visible,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    isConfirmLoading = false,
    confirmDisabled = false,
    destructive = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps): ReactElement {
    const isConfirmDisabled = confirmDisabled || isConfirmLoading;
    const confirmButtonColor = destructive ? COLORS.error : COLORS.primary;

    return (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
            onRequestClose={onCancel}
        >
            <View style={styles.backdrop}>
                <Pressable style={styles.backdropPressable} onPress={onCancel} />
                <View style={styles.card}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    <View style={styles.actions}>
                        <Pressable style={styles.cancelButton} onPress={onCancel}>
                            <Text style={styles.cancelLabel}>{cancelLabel}</Text>
                        </Pressable>
                        <Pressable
                            style={[
                                styles.confirmButton,
                                { backgroundColor: confirmButtonColor },
                                isConfirmDisabled ? styles.buttonDisabled : null,
                            ]}
                            onPress={onConfirm}
                            disabled={isConfirmDisabled}
                        >
                            {isConfirmLoading ? (
                                <ActivityIndicator size="small" color={COLORS.surface} />
                            ) : (
                                <Text style={styles.confirmLabel}>{confirmLabel}</Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        alignItems: "center",
        justifyContent: "center",
        padding: SPACING._20,
    },
    backdropPressable: {
        ...StyleSheet.absoluteFillObject,
    },
    card: {
        width: "100%",
        maxWidth: 360,
        borderRadius: RADIUS.lg,
        backgroundColor: COLORS.surface,
        padding: SPACING._20,
        gap: SPACING._12,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.16,
        shadowRadius: 14,
        elevation: 4,
    },
    title: {
        fontSize: TYPOGRAPHY.sizes.sectionTitle,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.textPrimary,
    },
    message: {
        fontSize: TYPOGRAPHY.sizes.body,
        color: COLORS.textSecondary,
    },
    actions: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: SPACING.sm,
        marginTop: SPACING._6,
    },
    cancelButton: {
        paddingVertical: SPACING._10,
        paddingHorizontal: SPACING._14,
        borderRadius: RADIUS.field,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.primarySubtle,
    },
    cancelLabel: {
        fontSize: TYPOGRAPHY.sizes.body,
        fontWeight: TYPOGRAPHY.weights.semibold,
        color: COLORS.textPrimary,
    },
    confirmButton: {
        paddingVertical: SPACING._10,
        paddingHorizontal: SPACING._14,
        borderRadius: RADIUS.field,
    },
    confirmLabel: {
        fontSize: TYPOGRAPHY.sizes.body,
        fontWeight: TYPOGRAPHY.weights.semibold,
        color: COLORS.surface,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
});
