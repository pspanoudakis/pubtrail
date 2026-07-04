import { isFirebaseConfigured } from "@/firebaseConfig";
import {
    mapEntityToFirestoreCrawl,
    mapFirestoreCrawlToEntity,
    mapFirestoreStopToEntity,
    toUserReference,
} from "@/redux/mappers/activeCrawlMappers";
import {
    addParticipantToCrawl,
    clearActiveCrawlForUsers,
    createCrawlWithStops,
    createMediaForCrawl,
    createStopForCrawl,
    fetchActiveCrawlForUser,
    fetchCrawlById,
    fetchStopsForCrawl,
    listenToStopsForCrawl,
    listenToCrawlDocument,
    setUserActiveCrawl,
    updateCrawl,
    updateStopForCrawl,
} from "../gateways/activeCrawlGateway";
import { uploadMediaToCloudinary } from "@/services/cloudinaryService";
import type { AppDispatch, RootState } from "@/redux/store/store";
import type { ActiveCrawlEntity, CrawlStopEntity, FirestoreStopDoc } from "@/redux/types/crawlTypes";
import type { GeoCoordinates } from "@/utils/geo";

let activeCrawlUnsubscribe: (() => void) | null = null;
let activeCrawlStopsUnsubscribe: (() => void) | null = null;

type ActiveCrawlUpdater = (crawl: ActiveCrawlEntity) => ActiveCrawlEntity;

export function setActiveCrawl(activeCrawl: ActiveCrawlEntity | null) {
    return {
        type: "ACTIVE_CRAWL_SET" as const,
        payload: activeCrawl,
    };
}

export function clearActiveCrawl() {
    return {
        type: "ACTIVE_CRAWL_CLEAR" as const,
    };
}

function stopActiveCrawlListener() {
    if (activeCrawlUnsubscribe) {
        activeCrawlUnsubscribe();
        activeCrawlUnsubscribe = null;
    }
}

function stopActiveCrawlStopsListener() {
    if (activeCrawlStopsUnsubscribe) {
        activeCrawlStopsUnsubscribe();
        activeCrawlStopsUnsubscribe = null;
    }
}

function stopAllActiveCrawlListeners() {
    stopActiveCrawlListener();
    stopActiveCrawlStopsListener();
}

function getLoggedUserId(state: RootState): string | null {
    return state.auth.user?.uid ?? null;
}

function canUseFirebaseForUser(loggedUserId: string | null): loggedUserId is string {
    return Boolean(loggedUserId && isFirebaseConfigured);
}

function getConfiguredActiveCrawl(getState: () => RootState): ActiveCrawlEntity | null {
    if (!isFirebaseConfigured) {
        return null;
    }

    return getState().activeCrawl;
}

function mapStopRecordsToEntities(stopRecords: Awaited<ReturnType<typeof fetchStopsForCrawl>>) {
    return stopRecords.map((stopRecord) => mapFirestoreStopToEntity(stopRecord.id, stopRecord.data));
}

async function fetchMappedActiveCrawlForUser(loggedUserId: string): Promise<ActiveCrawlEntity | null> {
    const activeCrawlRecord = await fetchActiveCrawlForUser(loggedUserId);

    if (!activeCrawlRecord) {
        return null;
    }

    return mapFirestoreCrawlToEntity(activeCrawlRecord.id, activeCrawlRecord.data);
}

function setActiveCrawlPreservingStops(
    dispatch: AppDispatch,
    getState: () => RootState,
    nextCrawl: ActiveCrawlEntity | null
) {
    if (!nextCrawl) {
        dispatch(setActiveCrawl(null));
        return;
    }

    const existingStops = getState().activeCrawl?.stops ?? [];
    dispatch(setActiveCrawl({ ...nextCrawl, stops: nextCrawl.stops.length ? nextCrawl.stops : existingStops }));
}

function updateCurrentActiveCrawlIfMatches(
    dispatch: AppDispatch,
    getState: () => RootState,
    crawlId: string,
    updater: ActiveCrawlUpdater
): boolean {
    const currentCrawl = getState().activeCrawl;

    if (currentCrawl?.id !== crawlId) {
        return false;
    }

    const nextCrawl = updater(currentCrawl);

    if (nextCrawl === currentCrawl) {
        return true;
    }

    dispatch(setActiveCrawl(nextCrawl));
    return true;
}

function isCrawlForUser(crawl: ActiveCrawlEntity, userId: string): boolean {
    return crawl.creatorUserId === userId || crawl.participantIds.includes(userId);
}

function getLatestStopCoordinates(stops: CrawlStopEntity[]): GeoCoordinates | undefined {
    if (stops.length === 0) return;

    let latestStop = stops[0];

    for (const stop of stops.slice(1)) {
        if (stop.visitedOn >= latestStop.visitedOn) {
            latestStop = stop;
        }
    }

    return latestStop.coordinates;
}

export function startLoggedUserActiveCrawlSync() {
    return async function startLoggedUserActiveCrawlSyncThunkACB(
        dispatch: AppDispatch,
        getState: () => RootState
    ) {
        const loggedUserId = getLoggedUserId(getState());

        if (!canUseFirebaseForUser(loggedUserId)) {
            stopAllActiveCrawlListeners();
            dispatch(clearActiveCrawl());
            return;
        }

        stopAllActiveCrawlListeners();

        try {
            const activeCrawl = await fetchMappedActiveCrawlForUser(loggedUserId);

            if (!activeCrawl) {
                stopAllActiveCrawlListeners();
                dispatch(setActiveCrawl(null));
                return;
            }

            setActiveCrawlPreservingStops(dispatch, getState, activeCrawl);

            activeCrawlStopsUnsubscribe = listenToStopsForCrawl(
                activeCrawl.id,
                (stopRecords) => {
                    updateCurrentActiveCrawlIfMatches(dispatch, getState, activeCrawl.id, (currentCrawl) => ({
                        ...currentCrawl,
                        stops: mapStopRecordsToEntities(stopRecords),
                    }));
                },
                () => {
                    // Keep previous state on transient snapshot errors for this simplified flow.
                }
            );

            activeCrawlUnsubscribe = listenToCrawlDocument(
                activeCrawl.id,
                (crawlRecord) => {
                    if (!crawlRecord) {
                        stopAllActiveCrawlListeners();
                        dispatch(setActiveCrawl(null));
                        return;
                    }

                    const syncedCrawl = mapFirestoreCrawlToEntity(crawlRecord.id, crawlRecord.data);

                    if (!syncedCrawl.isActive) {
                        stopAllActiveCrawlListeners();
                        dispatch(setActiveCrawl(null));
                        return;
                    }

                    if (!isCrawlForUser(syncedCrawl, loggedUserId)) {
                        stopAllActiveCrawlListeners();
                        dispatch(setActiveCrawl(null));
                        return;
                    }

                    setActiveCrawlPreservingStops(dispatch, getState, syncedCrawl);
                },
                () => {
                    // Keep previous state on transient snapshot errors for this simplified flow.
                }
            );
        } catch {
            stopAllActiveCrawlListeners();
            dispatch(setActiveCrawl(null));
        }
    };
}

export function stopLoggedUserActiveCrawlSync() {
    return function stopLoggedUserActiveCrawlSyncThunkACB() {
        stopAllActiveCrawlListeners();
    };
}

export function refreshLoggedUserActiveCrawlOnce() {
    return async function refreshLoggedUserActiveCrawlOnceThunkACB(
        dispatch: AppDispatch,
        getState: () => RootState
    ): Promise<boolean> {
        const loggedUserId = getLoggedUserId(getState());

        if (!canUseFirebaseForUser(loggedUserId)) {
            dispatch(clearActiveCrawl());
            return false;
        }

        try {
            const activeCrawl = await fetchMappedActiveCrawlForUser(loggedUserId);

            if (!activeCrawl) {
                dispatch(setActiveCrawl(null));
                return false;
            }

            const stopRecords = await fetchStopsForCrawl(activeCrawl.id);

            dispatch(
                setActiveCrawl({
                    ...activeCrawl,
                    stops: mapStopRecordsToEntities(stopRecords),
                })
            );
            return true;
        } catch {
            return false;
        }
    };
}

export function createLoggedUserPubCrawl(
    crawlName: string,
    initialStops: CrawlStopEntity[] = [],
    isPublic = false
) {
    return async function createLoggedUserPubCrawlThunkACB(
        dispatch: AppDispatch,
        getState: () => RootState
    ): Promise<string | null> {
        const loggedUserId = getLoggedUserId(getState());

        if (!canUseFirebaseForUser(loggedUserId)) {
            return null;
        }

        const normalizedCrawlName = crawlName.trim() || "New Crawl";
        const userLocation = getState().map.userLocation;
        const normalizedStops: CrawlStopEntity[] = initialStops
            .map((stop) => ({
                id: stop.id,
                pubName: stop.pubName.trim(),
                notes: (stop.notes ?? "").trim(),
                coordinates: stop.coordinates ?? userLocation,
                visitedOn: stop.visitedOn ?? Date.now(),
            }))
            .filter((stop) => Boolean(stop.pubName));
        const latestStopCoordinates = getLatestStopCoordinates(normalizedStops);

        const crawlToCreate: ActiveCrawlEntity = {
            id: "",
            crawlName: normalizedCrawlName,
            creatorUserId: loggedUserId,
            lastStopLat: latestStopCoordinates?.latitude ?? null,
            lastStopLng: latestStopCoordinates?.longitude ?? null,
            isActive: true,
            isPublic: isPublic,
            participantIds: [loggedUserId],
            stops: [],
        };

        try {
            const { crawl: createdCrawlRecord, stops: createdStopRecords } = await createCrawlWithStops(
                mapEntityToFirestoreCrawl(crawlToCreate),
                normalizedStops
            );
            const createdCrawl: ActiveCrawlEntity = {
                ...crawlToCreate,
                id: createdCrawlRecord.id,
                stops: createdStopRecords.map((stopRecord) =>
                    mapFirestoreStopToEntity(stopRecord.id, stopRecord.data)
                ),
            };

            try {
                await setUserActiveCrawl(loggedUserId, createdCrawlRecord.id);
            } catch {
                // Keep the crawl creation result even if user doc update fails.
            }

            dispatch(setActiveCrawl(createdCrawl));
            return createdCrawlRecord.id;
        } catch {
            return null;
        }
    };
}

export function createStopForLoggedUserActiveCrawl(
    stopName: string,
    notes = "",
    coordinates: GeoCoordinates,
    visitedOn: number
) {
    return async function createStopForLoggedUserActiveCrawlThunkACB(
        dispatch: AppDispatch,
        getState: () => RootState
    ): Promise<string | null> {
        const loggedUserId = getLoggedUserId(getState());
        const activeCrawl = getConfiguredActiveCrawl(getState);

        if (!activeCrawl) {
            return null;
        }

        if (!loggedUserId || activeCrawl.creatorUserId !== loggedUserId) {
            return null;
        }

        const normalizedStopName = stopName.trim() || "Untitled Stop";
        const normalizedNotes = notes.trim();
        const userLocation = getState().map.userLocation;
        const normalizedCoordinates = coordinates ?? userLocation;

        try {
            const createdStopRecord = await createStopForCrawl(activeCrawl.id, {
                pubName: normalizedStopName,
                notes: normalizedNotes,
                coordinates: normalizedCoordinates,
                visitedOn,
            });

            const nextStops = [
                ...activeCrawl.stops,
                mapFirestoreStopToEntity(createdStopRecord.id, createdStopRecord.data),
            ];
            const latestStopCoordinates = getLatestStopCoordinates(nextStops);

            await updateCrawl(activeCrawl.id, {
                lastStopLat: latestStopCoordinates?.latitude,
                lastStopLng: latestStopCoordinates?.longitude,
            });

            updateCurrentActiveCrawlIfMatches(dispatch, getState, activeCrawl.id, (latestActiveCrawl) => {
                const stopAlreadyInState = latestActiveCrawl.stops.some(
                    (stop) => stop.id === createdStopRecord.id
                );

                if (stopAlreadyInState) {
                    return latestActiveCrawl;
                }

                return {
                    ...latestActiveCrawl,
                    ...latestStopCoordinates,
                    stops: [
                        ...latestActiveCrawl.stops,
                        mapFirestoreStopToEntity(createdStopRecord.id, createdStopRecord.data),
                    ],
                };
            });

            return createdStopRecord.id;
        } catch {
            return null;
        }
    };
}

export function updateLoggedUserActiveCrawl(crawlName: string, isPublic: boolean) {
    return async function updateLoggedUserActiveCrawlThunkACB(
        dispatch: AppDispatch,
        getState: () => RootState
    ): Promise<boolean> {
        const activeCrawl = getConfiguredActiveCrawl(getState);

        if (!activeCrawl) {
            return false;
        }

        const loggedUserId = getLoggedUserId(getState());
        const isCrawlOwner = !!loggedUserId && activeCrawl.creatorUserId === loggedUserId;
        const canUpdateVisibility = isCrawlOwner;

        const normalizedCrawlName = crawlName.trim() || activeCrawl.crawlName || "Untitled Crawl";

        try {
            await updateCrawl(
                activeCrawl.id,
                {
                  ...(isCrawlOwner ? { crawlName: normalizedCrawlName } : {}),
                  ...(canUpdateVisibility ? { isPublic } : {}),
                }
            );

            updateCurrentActiveCrawlIfMatches(dispatch, getState, activeCrawl.id, (latestActiveCrawl) => ({
                ...latestActiveCrawl,
                ...(isCrawlOwner ? { crawlName: normalizedCrawlName } : {}),
                ...(canUpdateVisibility ? { isPublic } : {}),
            }));

            return true;
        } catch {
            return false;
        }
    };
}


export function updateStopForLoggedUserActiveCrawl(stopId: string, stopName: string, notes = "", visitedOn?: number, coordinates?: GeoCoordinates) {
    return async function updateStopForLoggedUserActiveCrawlThunkACB(
        dispatch: AppDispatch,
        getState: () => RootState
    ): Promise<boolean> {
        const activeCrawl = getConfiguredActiveCrawl(getState);

        if (!activeCrawl || !stopId) {
            return false;
        }

        const currentStop = activeCrawl.stops.find((stop) => stop.id === stopId);
        const normalizedStopName = stopName.trim() || currentStop?.pubName || "Untitled Stop";
        const normalizedNotes = notes.trim() || currentStop?.notes || "";

        try {
            const updates: Partial<FirestoreStopDoc> = {
                pubName: normalizedStopName,
                notes: normalizedNotes,
                visitedOn: visitedOn ?? currentStop?.visitedOn ?? Date.now(),
            };
            if (coordinates) {
                // Gateway expects { latitude, longitude } for updates.coordinates
                updates.coordinates = coordinates as any; 
            }

            await updateStopForCrawl(activeCrawl.id, stopId, updates);

            const updatedStops = activeCrawl.stops.map((stop) =>
                stop.id === stopId
                    ? {
                          ...stop,
                          ...(coordinates ? { coordinates } : {}),
                          visitedOn: visitedOn ?? stop.visitedOn ?? Date.now(),
                      }
                    : stop
            );
            const latestStopCoordinates = getLatestStopCoordinates(updatedStops);

            await updateCrawl(activeCrawl.id, {
                lastStopLat: latestStopCoordinates?.latitude,
                lastStopLng: latestStopCoordinates?.longitude,
            });

            updateCurrentActiveCrawlIfMatches(dispatch, getState, activeCrawl.id, (latestActiveCrawl) => ({
                ...latestActiveCrawl,
                ...latestStopCoordinates,
                stops: latestActiveCrawl.stops.map((stop) =>
                    stop.id === stopId
                        ? {
                              ...stop,
                              pubName: normalizedStopName,
                              notes: normalizedNotes,
                              ...(coordinates ? { coordinates } : {}),
                              visitedOn: visitedOn ?? stop.visitedOn ?? Date.now(),
                          }
                        : stop
                ),
            }));

            return true;
        } catch {
            return false;
        }
    };
}

export function endLoggedUserActiveCrawl() {
    return async function endLoggedUserActiveCrawlThunkACB(
        dispatch: AppDispatch,
        getState: () => RootState
    ): Promise<boolean> {
        const activeCrawl = getConfiguredActiveCrawl(getState);

        if (!activeCrawl) {
            return false;
        }

        const loggedUserId = getLoggedUserId(getState());

        if (!loggedUserId || activeCrawl.creatorUserId !== loggedUserId) {
            return false;
        }

        try {
            await updateCrawl(activeCrawl.id, {
                isActive: false,
            });

            try {
                await clearActiveCrawlForUsers(activeCrawl.id, [
                    ...activeCrawl.participantIds,
                    activeCrawl.creatorUserId,
                ]);
            } catch {
                // Allow local cleanup even if user doc updates fail.
            }

            stopAllActiveCrawlListeners();
            dispatch(clearActiveCrawl());
            return true;
        } catch {
            return false;
        }
    };
}

export function leaveLoggedUserActiveCrawl() {
    return async function leaveLoggedUserActiveCrawlThunkACB(
        dispatch: AppDispatch,
        getState: () => RootState
    ): Promise<boolean> {
        const activeCrawl = getConfiguredActiveCrawl(getState);
        const loggedUserId = getLoggedUserId(getState());

        if (!activeCrawl || !canUseFirebaseForUser(loggedUserId)) {
            return false;
        }

        try {
            await setUserActiveCrawl(loggedUserId, null);

            stopAllActiveCrawlListeners();
            dispatch(clearActiveCrawl());
            return true;
        } catch {
            return false;
        }
    };
}

export type UploadMediaResult =
    | { status: "uploaded"; url: string }
    | { status: "no-active-crawl" }
    | { status: "no-crawl" }
    | { status: "not-authenticated" }
    | { status: "error"; message: string };

export function uploadMediaToCrawl(crawlId: string, fileUri: string, mimeType?: string) {
    return async function uploadMediaToCrawlThunkACB(
        _dispatch: AppDispatch,
        getState: () => RootState
    ): Promise<UploadMediaResult> {
        const loggedUserId = getLoggedUserId(getState());

        if (!canUseFirebaseForUser(loggedUserId)) {
            return { status: "not-authenticated" };
        }

        const normalizedCrawlId = crawlId?.trim();
        if (!normalizedCrawlId) {
            return { status: "no-crawl" };
        }

        if (!fileUri) {
            return { status: "error", message: "No file to upload." };
        }

        try {
            const uploadResult = await uploadMediaToCloudinary(fileUri, {
                mimeType,
                folder: `pubtrail/crawls/${normalizedCrawlId}`,
            });

            await createMediaForCrawl(normalizedCrawlId, {
                url: uploadResult.url,
                uploadedBy: toUserReference(loggedUserId),
            });

            return {
                status: "uploaded",
                url: uploadResult.url,
            };
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Failed to upload media.";
            return { status: "error", message };
        }
    };
}

export function uploadMediaToActiveCrawl(fileUri: string, mimeType?: string) {
    return async function uploadMediaToActiveCrawlThunkACB(
        dispatch: AppDispatch,
        getState: () => RootState
    ): Promise<UploadMediaResult> {
        const activeCrawl = getConfiguredActiveCrawl(getState);

        if (!activeCrawl) {
            return { status: "no-active-crawl" };
        }

        return dispatch(uploadMediaToCrawl(activeCrawl.id, fileUri, mimeType));
    };
}

export type JoinCrawlResult =
    | { status: "joined"; crawlId: string }
    | { status: "already-participant"; crawlId: string }
    | { status: "not-found" }
    | { status: "not-active" }
    | { status: "not-authenticated" }
    | { status: "error"; message: string };

export function joinCrawlById(rawCrawlId: string) {
    return async function joinCrawlByIdThunkACB(
        dispatch: AppDispatch,
        getState: () => RootState
    ): Promise<JoinCrawlResult> {
        const crawlId = rawCrawlId.trim();
        const loggedUserId = getLoggedUserId(getState());

        if (!canUseFirebaseForUser(loggedUserId)) {
            return { status: "not-authenticated" };
        }

        if (!crawlId) {
            return { status: "not-found" };
        }

        try {
            const crawlRecord = await fetchCrawlById(crawlId);

            if (!crawlRecord) {
                return { status: "not-found" };
            }

            const crawl = mapFirestoreCrawlToEntity(crawlRecord.id, crawlRecord.data);

            if (!crawl.isActive) {
                return { status: "not-active" };
            }

            const userReferencePath = toUserReference(loggedUserId);
            const alreadyParticipant = crawl.participantIds.includes(loggedUserId);

            if (!alreadyParticipant) {
                await addParticipantToCrawl(crawl.id, userReferencePath);
            }

            try {
                await setUserActiveCrawl(loggedUserId, crawl.id);
            } catch {
                // Keep join flow resilient even if user doc update fails.
            }

            const stopRecords = await fetchStopsForCrawl(crawl.id);
            dispatch(
                setActiveCrawl({
                    ...crawl,
                    participantIds: alreadyParticipant
                        ? crawl.participantIds
                        : [...crawl.participantIds, loggedUserId],
                    stops: mapStopRecordsToEntities(stopRecords),
                })
            );

            return {
                status: alreadyParticipant ? "already-participant" : "joined",
                crawlId: crawl.id,
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to join crawl.";
            return { status: "error", message };
        }
    };
}
