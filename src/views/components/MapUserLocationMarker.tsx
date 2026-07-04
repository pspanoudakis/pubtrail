import Mapbox from "@rnmapbox/maps";
import { StyleSheet, View } from "react-native"
import { coordinatesToArray, GeoCoordinates } from "@/utils/geo";

type MapUserLocationMarkerProps = {
    userLocation: GeoCoordinates
};

export function MapUserLocationMarker({
    userLocation
}: MapUserLocationMarkerProps) {
    return (
        <Mapbox.MarkerView
            id="userLocation"
            coordinate={coordinatesToArray(userLocation)}
        >
            <View style={styles.locationMarker} />
        </Mapbox.MarkerView>
    )
}

const styles = StyleSheet.create({
    locationMarker: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "blue",
        borderColor: "white",
        borderWidth: 3,
    },
});
