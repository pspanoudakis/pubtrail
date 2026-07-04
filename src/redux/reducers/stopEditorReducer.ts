import type { StopEditorState } from "@/redux/types/stopEditorTypes";

function getInitialState(): StopEditorState {
    return {
        stopName: "",
        stopNotes: "",
        isSaving: false,
        nearbyPlaces: [],
        visitedOn: Date.now(),
        isNearbyPlacesLoading: false,
        hasNearbyPlacesLoaded: false,
        nearbyPlacesError: null,
        selectedNearbyPlaceId: null,
        selectedPlaceType: null,
    }
}

type StopEditorAction =
    | {
          type: "STOP_EDITOR_HYDRATE";
          payload: {
              stopName: string;
              stopNotes: string;
              visitedOn?: number;
              resetNearbyPlaces: boolean;
          };
      }
    | { type: "STOP_EDITOR_SET_STOP_NAME"; payload: string }
    | { type: "STOP_EDITOR_SET_STOP_NOTES"; payload: string }
    | { type: "STOP_EDITOR_SET_SAVING"; payload: boolean }
    | { type: "STOP_EDITOR_SELECT_NEARBY_PLACE"; payload: { id: string; name: string } }
    | { type: "STOP_EDITOR_SELECT_CUSTOM_NAME" }
    | { type: "STOP_EDITOR_LOAD_NEARBY_PLACES" }
    | { type: "STOP_EDITOR_SET_NEARBY_PLACES"; payload: StopEditorState["nearbyPlaces"] }
    | { type: "STOP_EDITOR_SET_NEARBY_PLACES_ERROR"; payload: string }
    | { type: "STOP_EDITOR_SET_VISITED_ON"; payload: number }
    | { type: "STOP_EDITOR_CLEAR" };

const stopEditorReducer = (state = getInitialState(), action: StopEditorAction): StopEditorState => {
    switch (action.type) {
        case "STOP_EDITOR_HYDRATE":
            return {
                ...state,
                stopName: action.payload.stopName,
                stopNotes: action.payload.stopNotes,
                visitedOn: action.payload.visitedOn ?? state.visitedOn,
                isSaving: false,
                selectedNearbyPlaceId: null,
                selectedPlaceType: null,
                ...(action.payload.resetNearbyPlaces
                    ? {
                          nearbyPlaces: [],
                          isNearbyPlacesLoading: false,
                          hasNearbyPlacesLoaded: false,
                          nearbyPlacesError: null,
                      }
                    : {}),
            };
        case "STOP_EDITOR_SET_STOP_NAME":
            return {
                ...state,
                stopName: action.payload,
                selectedNearbyPlaceId: null,
                selectedPlaceType: action.payload.trim() ? "custom" : null,
            };
        case "STOP_EDITOR_SET_STOP_NOTES":
            return { ...state, stopNotes: action.payload };
        case "STOP_EDITOR_SET_SAVING":
            return { ...state, isSaving: action.payload };
        case "STOP_EDITOR_SELECT_NEARBY_PLACE":
            return {
                ...state,
                stopName: action.payload.name,
                selectedNearbyPlaceId: action.payload.id,
                selectedPlaceType: "nearby",
            };
        case "STOP_EDITOR_SELECT_CUSTOM_NAME":
            return {
                ...state,
                selectedNearbyPlaceId: null,
                selectedPlaceType: "custom",
            };
        case "STOP_EDITOR_LOAD_NEARBY_PLACES":
            return {
                ...state,
                isNearbyPlacesLoading: true,
                hasNearbyPlacesLoaded: false,
                nearbyPlacesError: null,
            };
        case "STOP_EDITOR_SET_NEARBY_PLACES":
            return {
                ...state,
                nearbyPlaces: action.payload,
                isNearbyPlacesLoading: false,
                hasNearbyPlacesLoaded: true,
                nearbyPlacesError: null,
            };
        case "STOP_EDITOR_SET_NEARBY_PLACES_ERROR":
            return {
                ...state,
                nearbyPlaces: [],
                isNearbyPlacesLoading: false,
                hasNearbyPlacesLoaded: true,
                nearbyPlacesError: action.payload,
            };
        case "STOP_EDITOR_SET_VISITED_ON":
            return { ...state, visitedOn: action.payload }
        case "STOP_EDITOR_CLEAR":
            return getInitialState();
        default:
            return state;
    }
};

export default stopEditorReducer;




