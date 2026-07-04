import Mapbox from "@/mapboxConfig";
import { GeoCoordinates } from "@/utils/geo";
import { ReactElement } from "react";
import { Pressable } from "react-native";
import { MapStopMarkerShape } from "./MapStopMarkerShape";

interface MapOverlayProps {
    points: GeoCoordinates[];
    onMarkerPressed: (point: GeoCoordinates, index: number) => void;
}


export function MapOverlay({ points, onMarkerPressed }: MapOverlayProps): ReactElement {
    return (
        <>
            {/* Connecting lines between stops */}
            {points.slice(0, -1).map((point, index) => (
                <Mapbox.ShapeSource
                    key={`line-${index}`}
                    id={`line-${index}`}
                    shape={{
                        type: "Feature",
                        properties: {},
                        geometry: {
                            type: "LineString",
                            coordinates: [
                                [point.longitude, point.latitude],
                                [points[index + 1].longitude, points[index + 1].latitude],
                            ],
                        },
                    }}
                >
                    <Mapbox.LineLayer
                        id={`line-layer-${index}`}
                        style={{
                            lineColor: "blue",
                            lineWidth: 3,
                            lineDasharray: [1, 3],
                        }}
                    />
                </Mapbox.ShapeSource>
            ))}

            {/* Direction arrows along the connecting lines */}
            {points.slice(0, -1).map((point, index) => (
                <Mapbox.ShapeSource
                    key={`arrow-source-${index}`}
                    id={`arrow-source-${index}`}
                    shape={{
                        type: "Feature",
                        properties: {},
                        geometry: {
                            type: "LineString",
                            coordinates: [
                                [point.longitude, point.latitude],
                                [points[index + 1].longitude, points[index + 1].latitude],
                            ],
                        },
                    }}
                >
                    <Mapbox.SymbolLayer
                        id={`arrow-layer-${index}`}
                        style={{
                            symbolPlacement: 'line-center',
                            textField: '➤',
                            textSize: 20,
                            textColor: "rgba(0, 0, 255, 0.9)",
                            textHaloColor: "white",
                            textHaloWidth: 2,
                            textRotationAlignment: 'map',
                            textPitchAlignment: 'map',
                            textKeepUpright: false, // Forces arrow to stay rigidly locked to the line regardless of angle
                            textAllowOverlap: true,
                            textIgnorePlacement: true,
                        }}
                    />
                </Mapbox.ShapeSource>
            ))}

            {/* Stop markers */}
            {points.map((point, index) => (
                <Mapbox.MarkerView
                    key={`point-${index}`}
                    id={`point-${index}`}
                    coordinate={[point.longitude, point.latitude]}
                >
                    <Pressable style={{ flex: 1 }} onPress={() => onMarkerPressed(point, index)}>
                        <MapStopMarkerShape/>
                    </Pressable>
                </Mapbox.MarkerView>
            ))}
        </>
    );
}
