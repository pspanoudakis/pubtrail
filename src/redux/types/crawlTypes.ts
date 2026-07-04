import type { GeoCoordinates } from "@/utils/geo";

export type FirestoreDocumentReferencePath = string;

export type FirestoreCrawlDoc = {
    crawlName: string;
    createdBy: FirestoreDocumentReferencePath;
    lastStopLat: number | null;
    lastStopLng: number | null;
    isActive: boolean;
    isPublic: boolean;
    participants: FirestoreDocumentReferencePath[];
};

export type FirestoreStopDoc = {
    pubName: string;
    notes: string;
    coordinates?: GeoCoordinates;
    visitedOn: number;
};

export type FirestoreCrawlMediaDoc = {
    url: string;
    uploadedBy: FirestoreDocumentReferencePath;
};

export type CrawlMediaItem = {
    id: string;
    url: string;
};

export type CrawlStopEntity = {
    id: string;
    pubName: string;
    notes: string;
    coordinates?: GeoCoordinates;
    visitedOn: number;
};

export type ActiveCrawlEntity = {
    id: string;
    crawlName: string;
    creatorUserId: string;
    lastStopLat: number | null;
    lastStopLng: number | null;
    isActive: boolean;
    isPublic: boolean;
    participantIds: string[];
    stops: CrawlStopEntity[];
};

export type ActiveCrawlScreenModel = {
    title: string;
    isOwner: boolean,
    participantIds: string[];
    stops: Array<{
        id: string;
        pubName: string;
        visitedOn: number;
        coordinates?: GeoCoordinates;
    }>;
    isPublic: boolean;
};

export type NewCrawlDraftState = {
    stops: CrawlStopEntity[];
};

export type NearbyCrawlEntity = {
    id: string;
    crawlName: string;
    lastStopLat: number;
    lastStopLng: number;
    participantCount: number;
    distanceMeters: number;
};

export type NearbyCrawlsState = {
    crawls: NearbyCrawlEntity[];
    isLoading: boolean;
    error: string | null;
};
