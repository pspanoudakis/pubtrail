import Mapbox from "@/mapboxConfig";
import { GeoCoordinates } from "@/utils/geo";
import {ComponentRef, ReactElement, Ref} from "react";
import {Pressable} from "react-native";
import { MapStopMarkerShape } from "./MapStopMarkerShape";

interface MapOverlayProps {
    points: GeoCoordinates[],
    mapRef: Ref<ComponentRef<typeof Mapbox.MapView>>
    onMarkerPressed: (point: GeoCoordinates) => void;
}

export function MapOverlay(props: MapOverlayProps): ReactElement {
    return (        <>
        {props.points.map((point, index) => (
            <Mapbox.MarkerView key={`point-${index}`} id={`point-${index}`} coordinate={[point.longitude, point.latitude]}>
            <Pressable style={{flex: 1}} onPress={() => props.onMarkerPressed(point)}>
                <MapStopMarkerShape/>
            </Pressable>
            </Mapbox.MarkerView>
        ))}
    </>
    )
}
