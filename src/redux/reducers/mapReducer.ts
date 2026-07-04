import { DEFAULT_LOCATION, type GeoCoordinates } from "@/utils/geo";

const initialState = {
    defaultLocation: DEFAULT_LOCATION,
    userLocation: DEFAULT_LOCATION,
    locationPermissionGranted: false,
    loading: false,
    error: null as string | null,
};

export type MapState = typeof initialState;

type MapAction =
    | { type: "MAP_SET_USER_LOCATION"; payload: GeoCoordinates }
    | { type: "MAP_SET_LOCATION_PERMISSION_GRANTED"; payload: boolean }
    | { type: "MAP_LOADING" }
    | { type: "MAP_ERROR"; payload: string }
    | { type: "MAP_CLEAR_ERROR" };

const mapReducer = (state = initialState, action: MapAction): MapState => {
    switch (action.type) {
        case "MAP_SET_USER_LOCATION":
            return { ...state, userLocation: action.payload, loading: false, error: null };
        case "MAP_SET_LOCATION_PERMISSION_GRANTED":
            return { ...state, locationPermissionGranted: action.payload };
        case "MAP_LOADING":
            return { ...state, loading: true, error: null };
        case "MAP_ERROR":
            return {
                ...state,
                userLocation: state.defaultLocation,
                loading: false,
                error: action.payload,
            };
        case "MAP_CLEAR_ERROR":
            return { ...state, error: null };
        default:
            return state;
    }
};

export default mapReducer;