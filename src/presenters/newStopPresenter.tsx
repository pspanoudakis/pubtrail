import { ReactElement, useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { EditStopView } from "@/views/editStopView";
import { useAppDispatch, useAppSelector } from "@/redux/store/hooks";
import { addNewCrawlDraftStop } from "@/redux/actions/newCrawlDraftActions";
import { createStopForLoggedUserActiveCrawl } from "@/redux/actions/activeCrawlActions";

import type { NearbyPlace } from "@/mapboxConfig";
import type { GeoCoordinates } from "@/utils/geo";
import { fetchNearbyFoodAndDrinkPlaces } from "@/mapboxConfig";
import {
    clearStopEditor,
    loadStopEditorNearbyPlaces,
    selectStopEditorCustomName,
    selectStopEditorNearbyPlace,
    setStopEditorNearbyPlaces,
    setStopEditorNearbyPlacesError,
    setStopEditorSaving,
    setStopEditorStopName,
    setStopEditorStopNotes,
    setStopEditorVisitedOn,
} from "@/redux/actions/stopEditorActions";
import { selectStopEditor } from "@/redux/selectors/stopEditorSelectors";

export function NewStopPresenter(): ReactElement {
    const { update, mode } = useLocalSearchParams<{
        update?: string;
        mode?: "active" | "draft";
    }>();
    const dispatch = useAppDispatch();
    const { userLocation, locationPermissionGranted } = useAppSelector((state) => state.map);
    const stopEditor = useAppSelector(selectStopEditor);
    const isActiveMode = mode === "active" || update === "true";

    const selectedNearbyPlace =
        stopEditor.selectedPlaceType === "nearby" && stopEditor.selectedNearbyPlaceId
            ? stopEditor.nearbyPlaces.find((p) => p.id === stopEditor.selectedNearbyPlaceId)
            : undefined;

    const stopCoordinatesForMap = selectedNearbyPlace?.coordinates;

    useEffect(() => {
        dispatch(clearStopEditor());

        return () => {
            dispatch(clearStopEditor());
        };
    }, [dispatch]);

    useEffect(() => {
        let cancelled = false;

        async function loadNearbyPlacesACB(position: GeoCoordinates) {
            dispatch(loadStopEditorNearbyPlaces());

            try {
                const places = await fetchNearbyFoodAndDrinkPlaces(position);

                if (!cancelled) {
                    dispatch(setStopEditorNearbyPlaces(places));
                }
            } catch (error) {
                if (!cancelled) {
                    dispatch(
                        setStopEditorNearbyPlacesError(
                            error instanceof Error ? error.message : "Unable to load nearby places."
                        )
                    );
                }
            }
        }

        void loadNearbyPlacesACB(userLocation);

        return () => {
            cancelled = true;
        };
    }, [dispatch, userLocation.latitude, userLocation.longitude]);

    function onNearbyPlacePressACB(place: NearbyPlace) {
        dispatch(selectStopEditorNearbyPlace(place));
    }

    function onCustomPlacePressACB() {
        dispatch(selectStopEditorCustomName());
    }

    async function onSaveACB() {
        if (stopEditor.isSaving) {
            return;
        }

        dispatch(setStopEditorSaving(true));

        const normalizedStopName = stopEditor.stopName.trim() || "Untitled Stop";
        const normalizedStopNotes = stopEditor.stopNotes.trim();
        
        let stopCoordinates = userLocation;
        if (stopEditor.selectedPlaceType === "nearby" && stopEditor.selectedNearbyPlaceId) {
            const selectedPlace = stopEditor.nearbyPlaces.find(p => p.id === stopEditor.selectedNearbyPlaceId);
            if (selectedPlace?.coordinates) {
                stopCoordinates = selectedPlace.coordinates;
            }
        }

        try {
            if (!isActiveMode) {
                dispatch(addNewCrawlDraftStop(normalizedStopName, normalizedStopNotes, stopCoordinates, stopEditor.visitedOn));
                router.back();
                return;
            }

            await dispatch(
                createStopForLoggedUserActiveCrawl(
                    normalizedStopName,
                    normalizedStopNotes,
                    stopCoordinates,
                    stopEditor.visitedOn
                )
            );
            router.back();
        } finally {
            dispatch(setStopEditorSaving(false));
        }
    }

    return (
        <EditStopView
            stopName={stopEditor.stopName}
            onStopNameChange={(text) => dispatch(setStopEditorStopName(text))}
            stopNotes={stopEditor.stopNotes}
            onStopNotesChange={(text) => dispatch(setStopEditorStopNotes(text))}
            visitedOn={stopEditor.visitedOn}
            onVisitedOnChange={(newMillis) => dispatch(setStopEditorVisitedOn(newMillis))}
            onSave={onSaveACB}
            isSaving={stopEditor.isSaving}
            isLocationGranted={locationPermissionGranted}
            userCoordinates={userLocation}
            stopCoordinates={stopCoordinatesForMap}
            nearbyPlaces={stopEditor.nearbyPlaces}
            isNearbyPlacesLoading={stopEditor.isNearbyPlacesLoading}
            hasNearbyPlacesLoaded={stopEditor.hasNearbyPlacesLoaded}
            nearbyPlacesError={stopEditor.nearbyPlacesError}
            selectedNearbyPlaceId={stopEditor.selectedNearbyPlaceId}
            isCustomPlaceSelected={stopEditor.selectedPlaceType === "custom"}
            onNearbyPlacePress={onNearbyPlacePressACB}
            onCustomPlacePress={onCustomPlacePressACB}
        />
    );
}
