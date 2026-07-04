import { ReactElement } from "react";
import { Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { CameraView } from "expo-camera";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/styles/theme";
import { commonStyles } from "@/styles/commonStyles";
import { ActionButton } from "@/views/components/ActionButton";

type JoinCrawlViewProps = {
    permissionGranted: boolean;
    permissionRequested: boolean;
    isJoining: boolean;
    scanPaused: boolean;
    error: string | null;
    manualId: string;
    onManualIdChange: (id: string) => void;
    onRequestPermission: () => void;
    onBarcodeScanned: (data: string) => void;
    onSubmitManualId: () => void;
};

export function JoinCrawlView({
    permissionGranted,
    permissionRequested,
    isJoining,
    scanPaused,
    error,
    manualId,
    onManualIdChange,
    onRequestPermission,
    onBarcodeScanned,
    onSubmitManualId,
}: JoinCrawlViewProps): ReactElement {
    const canUseCamera = Platform.OS !== "web";

    return (
        <View style={[commonStyles.screenContent, styles.container]}>
            <Text style={styles.title}>Join a Crawl</Text>
            <Text style={styles.subtitle}>
                {canUseCamera
                    ? "Point your camera at a crawl QR code, or paste a crawl ID below."
                    : "Paste a crawl ID below to join (camera scanning is not available on web)."}
            </Text>

            {canUseCamera ? (
                <View style={styles.cameraCard}>
                    {permissionGranted ? (
                        <CameraView
                            style={styles.camera}
                            facing="back"
                            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                            onBarcodeScanned={
                                scanPaused || isJoining
                                    ? undefined
                                    : (result) => onBarcodeScanned(result.data)
                            }
                        />
                    ) : (
                        <View style={styles.permissionBox}>
                            <MaterialIcons name="photo-camera" size={48} color={COLORS.textSecondary} />
                            <Text style={styles.permissionText}>
                                {permissionRequested
                                    ? "Camera permission is required to scan QR codes."
                                    : "We need camera permission to scan QR codes."}
                            </Text>
                            <ActionButton label="Grant camera access" onPress={onRequestPermission} />
                        </View>
                    )}
                </View>
            ) : null}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Text style={styles.orText}>Or enter a crawl ID manually</Text>
            <TextInput
                style={styles.input}
                placeholder="Crawl ID"
                placeholderTextColor={COLORS.textSecondary}
                value={manualId}
                onChangeText={onManualIdChange}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isJoining}
            />
            <ActionButton
                label={isJoining ? "Joining..." : "Join Crawl"}
                loading={isJoining}
                loadingLabel="Joining..."
                onPress={onSubmitManualId}
                disabled={isJoining || manualId.trim().length === 0}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: SPACING.md,
        paddingTop: SPACING.lg,
    },
    title: {
        fontSize: TYPOGRAPHY.sizes.heading,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.textPrimary,
    },
    subtitle: {
        fontSize: TYPOGRAPHY.sizes.label,
        color: COLORS.textSecondary,
    },
    cameraCard: {
        aspectRatio: 1,
        width: "100%",
        borderRadius: RADIUS.md,
        overflow: "hidden",
        backgroundColor: "#000",
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    camera: {
        flex: 1,
    },
    permissionBox: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: SPACING.md,
        padding: SPACING.lg,
        backgroundColor: COLORS.surface,
    },
    permissionText: {
        color: COLORS.textSecondary,
        fontSize: TYPOGRAPHY.sizes.body,
        textAlign: "center",
    },
    orText: {
        marginTop: SPACING.sm,
        fontSize: TYPOGRAPHY.sizes.small,
        color: COLORS.textSecondary,
    },
    input: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm + SPACING.xs,
        fontSize: TYPOGRAPHY.sizes.body,
        color: COLORS.textPrimary,
    },
    error: {
        color: COLORS.error,
        fontSize: TYPOGRAPHY.sizes.small,
    },
});
