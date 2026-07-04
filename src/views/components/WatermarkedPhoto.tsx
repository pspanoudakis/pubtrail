import { forwardRef, ReactElement, useImperativeHandle, useRef } from "react";
import { Image, ImageSourcePropType, StyleSheet, Text, View } from "react-native";
import ViewShot from "react-native-view-shot";

const logoSource: ImageSourcePropType = require("../../../assets/images/adaptive-foreground.png");

export type WatermarkedPhotoHandle = {
    /** Capture the rendered watermarked photo to a temporary JPEG file. Returns the resulting file uri. */
    captureToFile: () => Promise<string>;
};

type WatermarkedPhotoProps = {
    photoUri: string;
    timestamp: string;
};

export const WatermarkedPhoto = forwardRef<WatermarkedPhotoHandle, WatermarkedPhotoProps>(
    function WatermarkedPhoto(
        { photoUri, timestamp }: WatermarkedPhotoProps,
        ref
    ): ReactElement {
        const viewShotRef = useRef<ViewShot | null>(null);

        useImperativeHandle(ref, () => ({
            async captureToFile(): Promise<string> {
                const captureFn = viewShotRef.current?.capture;
                if (!captureFn) {
                    throw new Error("Watermark view is not ready to capture.");
                }
                const uri = await captureFn();
                return uri;
            },
        }));

        return (
            <ViewShot
                ref={viewShotRef}
                style={styles.container}
                options={{ format: "jpg", quality: 0.92, result: "tmpfile" }}
            >
                <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />

                <View style={styles.logoContainer} pointerEvents="none">
                    <Image source={logoSource} style={styles.logo} resizeMode="contain" />
                </View>

                <View style={styles.timestampContainer} pointerEvents="none">
                    <Text style={styles.timestampShadow}>{timestamp}</Text>
                    <Text style={styles.timestamp}>{timestamp}</Text>
                </View>
            </ViewShot>
        );
    }
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        position: "relative",
    },
    photo: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    logoContainer: {
        position: "absolute",
        top: 12,
        right: 12,
        backgroundColor: "rgba(0,0,0,0.35)",
        borderRadius: 10,
        padding: 6,
    },
    logo: {
        width: 56,
        height: 56,
        opacity: 0.95,
    },
    timestampContainer: {
        position: "absolute",
        bottom: 14,
        right: 14,
    },
    timestamp: {
        // Retro camcorder vibe: bright orange digits, monospace family.
        fontFamily: "Courier",
        fontSize: 18,
        fontWeight: "700",
        color: "#FF8A00",
        letterSpacing: 1,
    },
    timestampShadow: {
        // Dark drop-shadow layer rendered behind for contrast.
        position: "absolute",
        top: 1,
        left: 1,
        fontFamily: "Courier",
        fontSize: 18,
        fontWeight: "700",
        color: "rgba(0,0,0,0.85)",
        letterSpacing: 1,
    },
});
