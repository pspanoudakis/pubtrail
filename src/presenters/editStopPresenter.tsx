import { ReactElement, useEffect, useRef } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { EditStopView } from "@/views/editStopView";
import { useIsFocused } from "@react-navigation/native";
import { useActiveCrawlRefresh } from "@/hooks/useActiveCrawlRefresh";
import { useAppDispatch, useAppSelector } from "@/redux/store/hooks";
import type { NearbyPlace } from "@/mapboxConfig";
import type { GeoCoordinates } from "@/utils/geo";
import { fetchNearbyFoodAndDrinkPlaces } from "@/mapboxConfig";
import { selectActiveCrawl } from "@/redux/selectors/activeCrawlSelectors";
import { selectNewCrawlDraftStopById } from "@/redux/selectors/newCrawlDraftSelectors";
import { updateNewCrawlDraftStop } from "@/redux/actions/newCrawlDraftActions";
import {
    updateStopForLoggedUserActiveCrawl,
} from "@/redux/actions/activeCrawlActions";
import {
    clearStopEditor,
    loadStopEditorNearbyPlaces,
    hydrateStopEditor,
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

export function EditStopPresenter(): ReactElement {
    const { stopUid, update, mode } = useLocalSearchParams<{
        stopUid?: string;
        update?: string;
        mode?: "active" | "draft";
    }>();
    const dispatch = useAppDispatch();
    const isFocused = useIsFocused();
    const activeCrawl = useAppSelector(selectActiveCrawl);
    const stopEditor = useAppSelector(selectStopEditor);
    const { userLocation, locationPermissionGranted } = useAppSelector((state) => state.map);
    const normalizedStopId = stopUid ?? "";
    const isActiveMode = mode === "active" || update === "true";
    const {
        isRefreshing,
        isEntryLoading,
        refreshActiveCrawl: refreshActiveCrawlACB,
    } = useActiveCrawlRefresh({
        isActiveMode,
        isFocused,
    });
    const hydratedStopIdRef = useRef<string | null>(null);

    const newCrawlDraftStop = useAppSelector((state) =>
        selectNewCrawlDraftStopById(state, normalizedStopId)
    );

    const sourceStopForMap = normalizedStopId
        ? isActiveMode
            ? activeCrawl?.stops.find((stop) => stop.id === normalizedStopId)
            : newCrawlDraftStop
        : undefined;

    const selectedNearbyPlace =
        stopEditor.selectedPlaceType === "nearby" && stopEditor.selectedNearbyPlaceId
            ? stopEditor.nearbyPlaces.find((p) => p.id === stopEditor.selectedNearbyPlaceId)
            : undefined;

    const stopCoordinatesForMap: GeoCoordinates | undefined =
        stopEditor.selectedPlaceType === "nearby"
            ? selectedNearbyPlace?.coordinates
            : stopEditor.selectedPlaceType === "custom"
                ? undefined
                : sourceStopForMap?.coordinates;

    useEffect(() => {
        if (!isFocused || !isActiveMode) {
            return;
        }

        void refreshActiveCrawlACB(false, true);
    }, [isActiveMode, isFocused, refreshActiveCrawlACB]);

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

        if (isFocused) {
            void loadNearbyPlacesACB(userLocation);
        }

        return () => {
            cancelled = true;
        };
    }, [dispatch, isFocused, userLocation.latitude, userLocation.longitude]);

    useEffect(() => {
        if (!normalizedStopId) {
            return;
        }

        if (hydratedStopIdRef.current === normalizedStopId) {
            return;
        }

        const sourceStop = isActiveMode
            ? activeCrawl?.stops.find((stop) => stop.id === normalizedStopId)
            : newCrawlDraftStop;

        if (!sourceStop) {
            return;
        }

        dispatch(clearStopEditor());
        dispatch(
            hydrateStopEditor({
                stopName: sourceStop.pubName,
                stopNotes: sourceStop.notes,
                visitedOn: sourceStop.visitedOn,
                resetNearbyPlaces: true,
            })
        );
        hydratedStopIdRef.current = normalizedStopId;
    }, [activeCrawl, dispatch, isActiveMode, newCrawlDraftStop, normalizedStopId]);

    useEffect(() => {
        return () => {
            dispatch(clearStopEditor());
            hydratedStopIdRef.current = null;
        };
    }, [dispatch]);

    async function onSaveACB() {
        if (stopEditor.isSaving) {
            return;
        }

        dispatch(setStopEditorSaving(true));

        const normalizedStopName = stopEditor.stopName.trim() || "Untitled Stop";
        const normalizedStopNotes = stopEditor.stopNotes.trim();

        let stopCoordinates: GeoCoordinates | undefined = undefined;
        if (stopEditor.selectedPlaceType === "nearby" && stopEditor.selectedNearbyPlaceId) {
            const selectedPlace = stopEditor.nearbyPlaces.find(p => p.id === stopEditor.selectedNearbyPlaceId);
            if (selectedPlace?.coordinates) {
                stopCoordinates = selectedPlace.coordinates;
            }
        } else if (stopEditor.selectedPlaceType === "custom") {
            stopCoordinates = userLocation;
        } // Otherwise preserve current coordinates if undefined

        if (isActiveMode && normalizedStopId) {
            try {
                await dispatch(
                    updateStopForLoggedUserActiveCrawl(
                        normalizedStopId,
                        normalizedStopName,
                        normalizedStopNotes,
                        stopEditor.visitedOn,
                        stopCoordinates
                    )
                );
            } finally {
                dispatch(setStopEditorSaving(false));
            }
            return;
        }

        try {
            if (!isActiveMode && normalizedStopId) {
                dispatch(updateNewCrawlDraftStop(normalizedStopId, normalizedStopName, normalizedStopNotes, stopEditor.visitedOn, stopCoordinates));
            }

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
            onVisitedOnChange={(newVal) => dispatch(setStopEditorVisitedOn(newVal))}
            onSave={onSaveACB}
            isLoading={isActiveMode ? isEntryLoading : false}
            isSaving={stopEditor.isSaving}
            isLocationGranted={locationPermissionGranted}
            userCoordinates={userLocation}
            stopCoordinates={stopCoordinatesForMap}
            refreshing={isActiveMode ? isRefreshing : false}
            onRefresh={isActiveMode ? () => void refreshActiveCrawlACB() : undefined}
            nearbyPlaces={stopEditor.nearbyPlaces}
            isNearbyPlacesLoading={stopEditor.isNearbyPlacesLoading}
            hasNearbyPlacesLoaded={stopEditor.hasNearbyPlacesLoaded}
            nearbyPlacesError={stopEditor.nearbyPlacesError}
            selectedNearbyPlaceId={stopEditor.selectedNearbyPlaceId}
            isCustomPlaceSelected={stopEditor.selectedPlaceType === "custom"}
            onNearbyPlacePress={(place: NearbyPlace) => dispatch(selectStopEditorNearbyPlace(place))}
            onCustomPlacePress={() => dispatch(selectStopEditorCustomName())}
        />
    );
}
