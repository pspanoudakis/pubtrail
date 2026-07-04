import { ReactElement } from "react";
import { FullScreenMap } from "@/views/components/FullScreenMap";
import { GeoCoordinates } from "@/utils/geo";

interface MapPageProps {
    isLocationGranted: boolean,
    userLocation: GeoCoordinates,
    overlayPoints: GeoCoordinates[],
    onMarkerPressed: () => void
    onRefocusPress: () => void
}

export function MapView(props: MapPageProps): ReactElement {
    return (
        <FullScreenMap
            isLocationGranted={props.isLocationGranted}
            userLocation={props.userLocation}
            overlayPoints={props.overlayPoints}
            onMarkerPressed={props.onMarkerPressed}
            onRefocusPress={props.onRefocusPress}
            bottomPadding={20}
        />
    );
}
