import {
    type ActiveCrawlEntity,
    type CrawlStopEntity,
    type FirestoreCrawlDoc,
    type FirestoreCrawlMediaDoc,
    type FirestoreStopDoc,
} from "@/redux/types/crawlTypes";

export function parseReferenceId(referenceOrId: string): string {
    const parts = referenceOrId.split("/").filter(Boolean);

    if (parts.length === 0) {
        return "";
    }

    return parts[parts.length - 1] ?? "";
}

export function toUserReference(userId: string): string {
    return `/users/${userId}`;
}

export function mapFirestoreCrawlToEntity(crawlId: string, doc: FirestoreCrawlDoc): ActiveCrawlEntity {
    return {
        id: crawlId,
        crawlName: doc.crawlName,
        creatorUserId: parseReferenceId(doc.createdBy),
        lastStopLat: doc.lastStopLat,
        lastStopLng: doc.lastStopLng,
        isActive: doc.isActive,
        isPublic: doc.isPublic,
        participantIds: doc.participants.map(parseReferenceId),
        stops: [],
    };
}

export function mapFirestoreStopToEntity(stopId: string, doc: FirestoreStopDoc): CrawlStopEntity {
    return {
        id: stopId,
        pubName: doc.pubName,
        notes: doc.notes,
        coordinates: doc.coordinates,
        visitedOn: doc.visitedOn,
    };
}

export function mapEntityToFirestoreCrawl(entity: ActiveCrawlEntity): FirestoreCrawlDoc {
    return {
        crawlName: entity.crawlName,
        createdBy: toUserReference(entity.creatorUserId),
        lastStopLat: entity.lastStopLat,
        lastStopLng: entity.lastStopLng,
        isActive: entity.isActive,
        isPublic: entity.isPublic,
        participants: entity.participantIds.map(toUserReference),
    };
}
export function mapMediaRecordsToItems(
    mediaRecords: Array<{ id: string; data: FirestoreCrawlMediaDoc }>
): Array<{ id: string; url: string }> {
    return mediaRecords
        .filter((record) => Boolean(record.data.url))
        .map((record) => ({
            id: record.id,
            url: record.data.url,
        }));
}
