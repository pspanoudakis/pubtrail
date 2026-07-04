import { Text, View, StyleSheet, Animated, ActivityIndicator } from "react-native";
import { ReactElement, useRef, useEffect } from "react";
import Mapbox from "@/mapboxConfig";
import { coordinatesToArray, GeoCoordinates } from "@/utils/geo";
import { MapOverlay } from "@/views/components/mapOverlay";
import { COLORS } from "@/styles/theme";
import { MapRefocusButton } from "@/views/components/MapRefocusButton";

interface FullScreenMapProps {
    isLocationGranted: boolean;
    userLocation: GeoCoordinates;
    overlayPoints: GeoCoordinates[];
    onMarkerPressed: (point: GeoCoordinates, index: number) => void;
    onRefocusPress?: () => void;
    bottomPadding: number;
    showSheen?: boolean;
}

export function FullScreenMap({
    isLocationGranted,
    userLocation,
    overlayPoints,
    onMarkerPressed,
    onRefocusPress,
    bottomPadding,
    showSheen,
}: FullScreenMapProps): ReactElement {
    const cameraRef = useRef<Mapbox.Camera>(null);
    const opacity = useRef(new Animated.Value(0)).current;
    const hasCompletedInitialRender = useRef(false);

    function updateCameraToBounds(animated: boolean) {
        if (!cameraRef.current) return;
        const duration = animated ? 500 : 0;

        if (overlayPoints.length > 1) {
            const lons = overlayPoints.map((p) => p.longitude);
            const lats = overlayPoints.map((p) => p.latitude);
            cameraRef.current.fitBounds(
                [Math.max(...lons), Math.max(...lats)], // ne
                [Math.min(...lons), Math.min(...lats)], // sw
                [100, 50, bottomPadding + 50, 50], // padding: [top, right, bottom, left]
                duration
            );
        } else if (overlayPoints.length === 1) {
            cameraRef.current.setCamera({
                centerCoordinate: [overlayPoints[0].longitude, overlayPoints[0].latitude],
                zoomLevel: 14,
                animationDuration: duration,
            });
        } else {
            cameraRef.current.setCamera({
                centerCoordinate: coordinatesToArray(userLocation),
                zoomLevel: 12,
                animationDuration: duration,
            });
        }
    }

    function onRefocusPressACB() {
        updateCameraToBounds(true);
        if (onRefocusPress) {
            onRefocusPress();
        }
    }

    function onMapReady() {
        if (hasCompletedInitialRender.current) {
            return;
        }

        hasCompletedInitialRender.current = true;
        updateCameraToBounds(false);

        Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }

    // Automatically re-center map if route stops change after it's loaded
    useEffect(() => {
        if (hasCompletedInitialRender.current) {
            updateCameraToBounds(true);
        }
    }, [overlayPoints]);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.map, { opacity }]}>
                <Mapbox.MapView
                    style={StyleSheet.absoluteFill}
                    attributionEnabled={false}
                    logoEnabled={false}
                    scaleBarPosition={{ bottom: 10, left: 10 }}
                    onDidFinishRenderingFrameFully={onMapReady}
                    onDidFinishLoadingMap={onMapReady}
                    onDidFinishLoadingStyle={onMapReady}
                >
                    <Mapbox.Camera
                        ref={cameraRef}
                        defaultSettings={{
                            centerCoordinate: coordinatesToArray(userLocation),
                            zoomLevel: 12,
                        }}
                    />

                    {isLocationGranted ? <Mapbox.LocationPuck puckBearing={"heading"} /> : null}

                    {overlayPoints.length > 0 && (
                        <MapOverlay points={overlayPoints} onMarkerPressed={onMarkerPressed ?? (() => {})} />
                    )}
                </Mapbox.MapView>
            </Animated.View>

            {/* Placeholder displayed until the map has fully rendered (non-blocking) */}
            <Animated.View
                pointerEvents="none"
                style={[
                    styles.mapPlaceholder,
                    {
                        opacity: opacity.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 0],
                        }),
                    },
                ]}
            >
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.placeholderText}>Loading map...</Text>
            </Animated.View>

            {showSheen && <View pointerEvents="none" style={styles.mapSheen} />}

            <MapRefocusButton
                onPress={onRefocusPressACB}
                iconSize={30}
                buttonSize={60}
                bottom={bottomPadding}
                right={10}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    mapPlaceholder: {
        position: "absolute",
        top: "45%",
        left: 0,
        right: 0,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        zIndex: 1,
    },
    placeholderText: {
        marginTop: 8,
        color: COLORS.textSecondary ?? "#666",
        fontSize: 13,
    },
    mapSheen: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.05)",
    },
});
