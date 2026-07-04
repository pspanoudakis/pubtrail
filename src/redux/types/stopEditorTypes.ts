import type { NearbyPlace } from "@/mapboxConfig";

export type StopEditorState = {
    stopName: string;
    stopNotes: string;
    isSaving: boolean;
    nearbyPlaces: NearbyPlace[];
    isNearbyPlacesLoading: boolean;
    hasNearbyPlacesLoaded: boolean;
    nearbyPlacesError: string | null;
    selectedNearbyPlaceId: string | null;
    visitedOn: number;
    selectedPlaceType: "nearby" | "custom" | null;
};

