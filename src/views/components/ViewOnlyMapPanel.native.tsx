import { ReactElement, useEffect, useMemo, useRef } from "react";
import { ActivityIndicator, Animated, StyleSheet, Text, View } from "react-native";
import Mapbox from "@/mapboxConfig";
import { COLORS } from "@/styles/theme";
import { MapRefocusButton } from "./MapRefocusButton";
import { coordinatesToArray, DEFAULT_LOCATION, type GeoCoordinates } from "@/utils/geo";
import { MapStopMarkerShape } from "./MapStopMarkerShape";

type ViewOnlyMapPanelProps = {
    coordinates?: GeoCoordinates;
    userCoordinates?: GeoCoordinates;
    isLocationGranted?: boolean;
    title?: string;
    subtitle?: string;
    height?: number;
    onMapInteractionChange?: (isInteracting: boolean) => void;
};

export function ViewOnlyMapPanel({
    coordinates,
    userCoordinates = DEFAULT_LOCATION,
    isLocationGranted,
    title = "Stop Location",
    subtitle = "Pinned from the crawl route",
    height = 340,
    onMapInteractionChange,
}: ViewOnlyMapPanelProps): ReactElement {
    const mapOpacity = useRef(new Animated.Value(0)).current;
    const cameraRef = useRef<Mapbox.Camera>(null);
    const hasCompletedInitialRender = useRef(false);

    const overlayPoints = useMemo(() => {
        const points: GeoCoordinates[] = [];

        if (coordinates) {
            points.push(coordinates);
        }

        if (userCoordinates) {
            const alreadyHasUserPoint = points.some(
                (p) => p.latitude === userCoordinates.latitude && p.longitude === userCoordinates.longitude
            );
            if (!alreadyHasUserPoint) {
                points.push(userCoordinates);
            }
        }

        return points;
    }, [coordinates, userCoordinates]);

    function updateCameraToBounds(animated: boolean) {
        if (!cameraRef.current) {
            return;
        }

        const duration = animated ? 500 : 0;

        if (overlayPoints.length > 1) {
            const lons = overlayPoints.map((p) => p.longitude);
            const lats = overlayPoints.map((p) => p.latitude);
            cameraRef.current.fitBounds(
                [Math.max(...lons), Math.max(...lats)], // ne
                [Math.min(...lons), Math.min(...lats)], // sw
                [70, 70, 70, 70],
                duration
            );
            return;
        }

        if (overlayPoints.length === 1) {
            cameraRef.current.setCamera({
                centerCoordinate: [overlayPoints[0].longitude, overlayPoints[0].latitude],
                zoomLevel: 13,
                animationDuration: duration,
            });
        }
    }

    useEffect(() => {
        if (!hasCompletedInitialRender.current) {
            return;
        }

        updateCameraToBounds(true);
    }, [overlayPoints]);

    function onMapReady() {
        if (hasCompletedInitialRender.current) {
            return;
        }

        hasCompletedInitialRender.current = true;
        updateCameraToBounds(false);

        Animated.timing(mapOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }

    function onRefocusPressACB() {
        updateCameraToBounds(true);
    }

    return (
        <View style={styles.mapSection}>
            <View style={styles.mapHeader}>
                <Text style={styles.mapTitle}>{title}</Text>
                <Text style={styles.mapSubtitle}>{subtitle}</Text>
            </View>
            <View style={[styles.mapFrame, { height }]}> 
                <Animated.View style={[styles.stopMap, { opacity: mapOpacity }]}> 
                    <Mapbox.MapView
                        style={StyleSheet.absoluteFill}
                        attributionEnabled={false}
                        logoEnabled={false}
                        scaleBarEnabled={false}
                        onDidFinishRenderingFrameFully={onMapReady}
                        onTouchStart={() => onMapInteractionChange?.(true)}
                        onTouchEnd={() => onMapInteractionChange?.(false)}
                        onTouchCancel={() => onMapInteractionChange?.(false)}
                    >
                        <Mapbox.Camera
                            ref={cameraRef}
                            defaultSettings={{
                                centerCoordinate: coordinatesToArray(
                                    coordinates ?? userCoordinates
                                ),
                                zoomLevel: 12,
                            }}
                        />

                        {isLocationGranted ? <Mapbox.LocationPuck puckBearing={"heading"} /> : null}

                        {coordinates ? (
                            <Mapbox.PointAnnotation
                                id="stop-location-pin"
                                coordinate={[coordinates.longitude, coordinates.latitude]}
                            >
                                <MapStopMarkerShape/>
                            </Mapbox.PointAnnotation>
                        ) : null}
                    </Mapbox.MapView>
                </Animated.View>

                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.mapLoadingOverlay,
                        {
                            opacity: mapOpacity.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 0],
                            }),
                        },
                    ]}
                >
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.mapLoadingText}>Loading map...</Text>
                </Animated.View>

                <View pointerEvents="none" style={styles.mapSheen} />

                <MapRefocusButton onPress={onRefocusPressACB} iconSize={24} buttonSize={46} bottom={12} right={12} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mapSection: {
        gap: 8,
    },
    mapHeader: {
        flexDirection: "row",
        alignItems: "baseline",
        justifyContent: "space-between",
    },
    mapTitle: {
        fontSize: 15,
        color: COLORS.textPrimary,
        fontWeight: "700",
    },
    mapSubtitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: "500",
    },
    mapFrame: {
        borderRadius: 14,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.mapBackground,
    },
    stopMap: {
        flex: 1,
    },
    mapLoadingOverlay: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(246, 241, 232, 0.92)",
        gap: 8,
    },
    mapLoadingText: {
        color: COLORS.textSecondary,
        fontSize: 13,
        fontWeight: "500",
    },
    mapSheen: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 40,
        backgroundColor: "rgba(255, 255, 255, 0.15)",
    },
});
