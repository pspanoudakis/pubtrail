import * as Location from "expo-location";
import type {AppDispatch} from "@/redux/store/store";
import { GeoCoordinates } from "@/utils/geo";


export function setUserLocation(location: GeoCoordinates) {
    return { type: "MAP_SET_USER_LOCATION", payload: location };
}

export function setLocationPermissionGranted(granted: boolean) {
    return { type: "MAP_SET_LOCATION_PERMISSION_GRANTED", payload: granted };
}

export function mapLoading() {
    return { type: "MAP_LOADING" };
}

export function mapError(error: string) {
    return { type: "MAP_ERROR", payload: error };
}

export function requestLocationPermission() {
    return async function requestLocationPermissionThunkACB(dispatch: AppDispatch) {
        dispatch(mapLoading());
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            
            if (status === "granted") {
                dispatch(setLocationPermissionGranted(true));
                dispatch(getCurrentLocation());
            } else {
                dispatch(setLocationPermissionGranted(false));
                dispatch(mapError("Location permission denied"));
            }
        } catch (error) {
            dispatch(mapError(error instanceof Error ? error.message : "Failed to request location permission"));
        }
    };
}

export function getCurrentLocation() {
    return async function getCurrentLocationThunkACB(dispatch: AppDispatch) {
        dispatch(mapLoading());
        try {
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const userLocation: GeoCoordinates = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };

            dispatch(setUserLocation(userLocation));
        } catch (error) {
            dispatch(mapError(error instanceof Error ? error.message : "Failed to get current location"));
        }
    };
}


