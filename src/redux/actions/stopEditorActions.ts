import type { NearbyPlace } from "@/mapboxConfig";

export function hydrateStopEditor(options: {
    stopName: string;
    stopNotes: string;
    visitedOn?: number;
    resetNearbyPlaces?: boolean;
}) {
    return {
        type: "STOP_EDITOR_HYDRATE" as const,
        payload: {
            stopName: options.stopName,
            stopNotes: options.stopNotes,
            visitedOn: options.visitedOn,
            resetNearbyPlaces: options.resetNearbyPlaces ?? false,
        },
    };
}

export function setStopEditorStopName(stopName: string) {
    return {
        type: "STOP_EDITOR_SET_STOP_NAME" as const,
        payload: stopName,
    };
}

export function setStopEditorStopNotes(stopNotes: string) {
    return {
        type: "STOP_EDITOR_SET_STOP_NOTES" as const,
        payload: stopNotes,
    };
}

export function setStopEditorVisitedOn(newValue: number) {
    return {
        type: "STOP_EDITOR_SET_VISITED_ON" as const,
        payload: newValue,
    };
}

export function setStopEditorSaving(isSaving: boolean) {
    return {
        type: "STOP_EDITOR_SET_SAVING" as const,
        payload: isSaving,
    };
}

export function selectStopEditorNearbyPlace(place: NearbyPlace) {
    return {
        type: "STOP_EDITOR_SELECT_NEARBY_PLACE" as const,
        payload: place,
    };
}

export function selectStopEditorCustomName() {
    return {
        type: "STOP_EDITOR_SELECT_CUSTOM_NAME" as const,
    };
}

export function loadStopEditorNearbyPlaces() {
    return {
        type: "STOP_EDITOR_LOAD_NEARBY_PLACES" as const,
    };
}

export function setStopEditorNearbyPlaces(nearbyPlaces: NearbyPlace[]) {
    return {
        type: "STOP_EDITOR_SET_NEARBY_PLACES" as const,
        payload: nearbyPlaces,
    };
}

export function setStopEditorNearbyPlacesError(error: string) {
    return {
        type: "STOP_EDITOR_SET_NEARBY_PLACES_ERROR" as const,
        payload: error,
    };
}

export function clearStopEditor() {
    return {
        type: "STOP_EDITOR_CLEAR" as const,
    };
}


