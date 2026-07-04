import { isFirebaseConfigured } from "@/firebaseConfig";
import { fetchNearbyCrawls } from "@/redux/gateways/activeCrawlGateway";
import type { NearbyCrawlEntity } from "@/redux/types/crawlTypes";
import type { AppDispatch } from "@/redux/store/store";
import type { GeoCoordinates } from "@/utils/geo";

export function setNearbyCrawls(crawls: NearbyCrawlEntity[]) {
    return {
        type: "NEARBY_CRAWLS_SET" as const,
        payload: crawls,
    };
}

export function nearbyCrawlsLoading() {
    return {
        type: "NEARBY_CRAWLS_LOADING" as const,
    };
}

export function nearbyCrawlsError(error: string) {
    return {
        type: "NEARBY_CRAWLS_ERROR" as const,
        payload: error,
    };
}

export function clearNearbyCrawls() {
    return {
        type: "NEARBY_CRAWLS_CLEAR" as const,
    };
}

export function loadNearbyCrawls(center: GeoCoordinates, radiusMeters = 4000) {
    return async function loadNearbyCrawlsThunkACB(
        dispatch: AppDispatch
    ): Promise<void> {
        if (!isFirebaseConfigured) {
            dispatch(clearNearbyCrawls());
            return;
        }

        if (!center || typeof center.latitude !== "number" || typeof center.longitude !== "number") {
            dispatch(clearNearbyCrawls());
            return;
        }

        dispatch(nearbyCrawlsLoading());

        try {
            const crawls = await fetchNearbyCrawls(center, radiusMeters);

            dispatch(setNearbyCrawls(crawls));
        } catch (error) {
            dispatch(setNearbyCrawls([]));
            dispatch(
                nearbyCrawlsError(
                    error instanceof Error ? error.message : "Failed to load nearby crawls."
                )
            );
        }
    };
}