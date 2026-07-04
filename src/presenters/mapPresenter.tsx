import {MapView} from "@/views/mapView";
import {useAppDispatch, useAppSelector} from "@/redux/store/hooks";
import {useEffect, useMemo} from "react";
import {requestLocationPermission} from "@/redux/actions/mapActions";
import {router} from "expo-router";
import {
    selectActiveCrawlScreenModel,
    selectHasActiveCrawl,
} from "@/redux/selectors/activeCrawlSelectors";
import { coordinatesToArray, GeoCoordinates } from "@/utils/geo";

export function MapPresenter() {
    const dispatch = useAppDispatch();
    const { userLocation, defaultLocation, locationPermissionGranted, error } = useAppSelector((state) => state.map);
    const hasActiveCrawl = useAppSelector(selectHasActiveCrawl);
    const activeCrawlDetails = useAppSelector(selectActiveCrawlScreenModel);

    useEffect(() => {
        // Request location permission on component mount (run only once)
        dispatch(requestLocationPermission());
    }, [dispatch]);

    if (error) {
        console.error("Map error:", error);
    }

    const overlayPoints = useMemo<GeoCoordinates[]>(
        () =>
            activeCrawlDetails.stops
                .filter((stop) => Boolean(stop.coordinates))
                .map((stop) => stop.coordinates as GeoCoordinates),
        [activeCrawlDetails.stops]
    );

    return (
            <MapView
                isLocationGranted={locationPermissionGranted}
                onMarkerPressed={() => router.navigate(hasActiveCrawl ? "/activeCrawl" : "/newCrawl")}
                userLocation={userLocation ?? defaultLocation}
                onRefocusPress={() => {}}
                overlayPoints={hasActiveCrawl ? overlayPoints : []}
            />
    );
}