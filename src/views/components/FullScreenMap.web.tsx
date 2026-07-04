import { View, StyleSheet } from "react-native";
import { ComponentRef, ReactElement, useEffect, useRef } from "react";
import Mapbox from "@/mapboxConfig";
import { coordinatesToArray, GeoCoordinates } from "@/utils/geo"
import { MapOverlay } from "@/views/components/mapOverlay";
import { MapRefocusButton } from "@/views/components/MapRefocusButton";
import { MapUserLocationMarker } from "./MapUserLocationMarker";

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
    const mapRef = useRef<ComponentRef<typeof Mapbox.MapView>>(null);

    function updateCameraToBounds(animated: boolean) {
        if (!cameraRef.current) return;
        const duration = animated ? 500 : 0;

        if (overlayPoints.length > 1) {
            const lons = overlayPoints.map((p) => p.longitude);
            const lats = overlayPoints.map((p) => p.latitude);
            
            cameraRef.current.setCamera({
                bounds: {
                    ne: [Math.max(...lons), Math.max(...lats)],
                    sw: [Math.min(...lons), Math.min(...lats)],
                    paddingLeft: 50,
                    paddingRight: 50,
                    paddingTop: 100,
                    paddingBottom: bottomPadding + 50,
                },
                animationDuration: duration,
            });
        } else if (overlayPoints.length === 1) {
            cameraRef.current.setCamera({
                centerCoordinate: coordinatesToArray(overlayPoints[0]),
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

    useEffect(() => {
        updateCameraToBounds(true);
    }, [userLocation, overlayPoints]);

    function onRefocusPressACB() {
        updateCameraToBounds(true);
        if (onRefocusPress) {
            onRefocusPress();
        }
    }

    return (
        <View style={styles.container}>
            <Mapbox.MapView ref={mapRef} style={styles.map}>
                <Mapbox.Camera
                    ref={cameraRef}
                    zoomLevel={12}
                    centerCoordinate={coordinatesToArray(userLocation)}
                />
                
                {isLocationGranted && <MapUserLocationMarker userLocation={userLocation}/>}

                {overlayPoints.length > 0 && (
                    <MapOverlay points={overlayPoints} onMarkerPressed={onMarkerPressed ?? (() => {})} />
                )}
            </Mapbox.MapView>

            {showSheen && <View pointerEvents="none" style={styles.mapSheen} />}

            <MapRefocusButton
                onPress={onRefocusPressACB}
                iconSize={30}
                buttonSize={40}
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
    locationMarker: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "blue",
        borderColor: "white",
        borderWidth: 3,
    },
    mapSheen: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.05)",
    },
});
