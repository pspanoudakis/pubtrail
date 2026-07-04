import type { GeoCoordinates } from "@/utils/geo";

function createDraftStopId(): string {
    return `draft-stop-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function addNewCrawlDraftStop(pubName: string, notes = "", coordinates: GeoCoordinates, visitedOn?: number) {
    return {
        type: "NEW_CRAWL_DRAFT_ADD_STOP" as const,
        payload: {
            id: createDraftStopId(),
            pubName,
            notes,
            coordinates,
            visitedOn: visitedOn ?? Date.now(),
        },
    };
}


export function updateNewCrawlDraftStop(stopId: string, pubName: string, notes?: string, visitedOn?: number, coordinates?: GeoCoordinates) {
    return {
        type: "NEW_CRAWL_DRAFT_UPDATE_STOP" as const,
        payload: {
            id: stopId,
            pubName,
            notes,
            visitedOn,
            coordinates,
        },
    };
}

export function clearNewCrawlDraft() {
    return {
        type: "NEW_CRAWL_DRAFT_CLEAR" as const,
    };
}
