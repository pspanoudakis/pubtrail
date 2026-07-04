import { ReactElement, RefObject } from "react";
import {
    ActivityIndicator,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { CameraView } from "expo-camera";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/styles/theme";
import { commonStyles } from "@/styles/commonStyles";
import { ActionButton } from "@/views/components/ActionButton";
import { WatermarkedPhoto, WatermarkedPhotoHandle } from "@/views/components/WatermarkedPhoto";

export type PendingCapture = {
    uri: string;
    timestamp: string;
};

type CaptureMediaViewProps = {
    cameraRef: RefObject<CameraView | null>;
    watermarkRef: RefObject<WatermarkedPhotoHandle | null>;
    cameraPermissionGranted: boolean;
    cameraPermissionRequested: boolean;
    onRequestCameraPermission: () => void;
    isUploading: boolean;
    error: string | null;
    pendingCapture: PendingCapture | null;
    onCapturePhoto: () => void;
    onConfirmUpload: () => void;
    onRetake: () => void;
    onCancel: () => void;
};

export function CaptureMediaView({
    cameraRef,
    watermarkRef,
    cameraPermissionGranted,
    cameraPermissionRequested,
    onRequestCameraPermission,
    isUploading,
    error,
    pendingCapture,
    onCapturePhoto,
    onConfirmUpload,
    onRetake,
    onCancel,
}: CaptureMediaViewProps): ReactElement {
    const canUseCamera = Platform.OS !== "web";

    if (!canUseCamera) {
        return (
            <View style={[commonStyles.screenContent, styles.fallbackContainer]}>
                <Text style={styles.title}>Capture Photo</Text>
                <Text style={styles.subtitle}>
                    In-app capture is only available on the mobile app.
                </Text>
                <ActionButton label="Go Back" onPress={onCancel} />
            </View>
        );
    }

    if (!cameraPermissionGranted) {
        return (
            <View style={[commonStyles.screenContent, styles.fallbackContainer]}>
                <MaterialIcons name="photo-camera" size={48} color={COLORS.textSecondary} />
                <Text style={styles.subtitle}>
                    {cameraPermissionRequested
                        ? "Camera permission is required to capture photos."
                        : "We need camera permission to capture photos."}
                </Text>
                <ActionButton
                    label="Grant camera access"
                    onPress={onRequestCameraPermission}
                />
            </View>
        );
    }

    if (pendingCapture) {
        return (
            <View style={styles.container}>
                <Text style={styles.previewTitle}>Submit this photo?</Text>
                <View style={styles.previewWrapper}>
                    <WatermarkedPhoto
                        ref={watermarkRef}
                        photoUri={pendingCapture.uri}
                        timestamp={pendingCapture.timestamp}
                    />
                    {isUploading ? (
                        <View style={styles.overlay}>
                            <ActivityIndicator size="large" color={COLORS.surface} />
                            <Text style={styles.overlayText}>Uploading...</Text>
                        </View>
                    ) : null}
                </View>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <View style={styles.previewActions}>
                    <ActionButton
                        label="Retake"
                        onPress={onRetake}
                        disabled={isUploading}
                        icon={
                            <MaterialIcons
                                name="refresh"
                                size={20}
                                color={COLORS.surface}
                            />
                        }
                    />
                    <ActionButton
                        label="Submit"
                        onPress={onConfirmUpload}
                        loading={isUploading}
                        loadingLabel="Uploading..."
                        disabled={isUploading}
                        icon={
                            <MaterialIcons
                                name="cloud-upload"
                                size={22}
                                color={COLORS.surface}
                            />
                        }
                    />
                    <ActionButton
                        label="Cancel"
                        onPress={onCancel}
                        disabled={isUploading}
                        icon={
                            <FontAwesome5
                                name="times"
                                size={18}
                                color={COLORS.surface}
                            />
                        }
                    />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.cameraWrapper}>
                <CameraView
                    ref={cameraRef}
                    style={styles.camera}
                    facing="back"
                    mode="picture"
                />
                {isUploading ? (
                    <View style={styles.overlay}>
                        <ActivityIndicator size="large" color={COLORS.surface} />
                        <Text style={styles.overlayText}>Uploading...</Text>
                    </View>
                ) : null}
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.controlRow}>
                <Pressable
                    onPress={onCancel}
                    disabled={isUploading}
                    style={[styles.secondaryButton, isUploading && styles.disabled]}
                >
                    <FontAwesome5 name="times" size={20} color={COLORS.primary} />
                </Pressable>

                <Pressable
                    onPress={onCapturePhoto}
                    disabled={isUploading}
                    style={[styles.shutter, isUploading && styles.disabled]}
                >
                    <View style={styles.shutterInner} />
                </Pressable>

                <View style={styles.spacer} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: SPACING.md,
        gap: SPACING.md,
        backgroundColor: COLORS.background,
    },
    fallbackContainer: {
        flex: 1,
        gap: SPACING.md,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: TYPOGRAPHY.sizes.heading,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.textPrimary,
    },
    subtitle: {
        fontSize: TYPOGRAPHY.sizes.body,
        color: COLORS.textSecondary,
        textAlign: "center",
    },
    cameraWrapper: {
        flex: 1,
        borderRadius: RADIUS.lg,
        overflow: "hidden",
        backgroundColor: "#000",
        position: "relative",
    },
    camera: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.55)",
        alignItems: "center",
        justifyContent: "center",
        gap: SPACING.sm,
    },
    overlayText: {
        color: COLORS.surface,
        fontSize: TYPOGRAPHY.sizes.body,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    error: {
        color: COLORS.error,
        fontSize: TYPOGRAPHY.sizes.small,
        textAlign: "center",
    },
    controlRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
    },
    secondaryButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: COLORS.primary,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.surface,
    },
    spacer: {
        width: 56,
    },
    shutter: {
        width: 76,
        height: 76,
        borderRadius: 38,
        borderWidth: 4,
        borderColor: COLORS.primary,
        backgroundColor: COLORS.surface,
        alignItems: "center",
        justifyContent: "center",
    },
    shutterInner: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
    },
    disabled: {
        opacity: 0.5,
    },
    previewTitle: {
        fontSize: TYPOGRAPHY.sizes.heading,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.textPrimary,
        textAlign: "center",
    },
    previewWrapper: {
        flex: 1,
        borderRadius: RADIUS.lg,
        overflow: "hidden",
        backgroundColor: "#000",
        position: "relative",
    },
    previewMedia: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    previewActions: {
        gap: SPACING.sm,
    },
});
