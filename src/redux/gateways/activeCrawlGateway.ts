import {
    addDoc,
    arrayUnion,
    collection,
    doc,
    GeoPoint,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    query,
    setDoc,
    type DocumentData,
    type DocumentSnapshot,
    updateDoc,
    writeBatch,
    where,
    Timestamp,
} from "firebase/firestore";
import type {
    FirestoreCrawlDoc,
    FirestoreStopDoc,
    FirestoreCrawlMediaDoc,
    NearbyCrawlEntity,
} from "@/redux/types/crawlTypes";
import { getBoundingBox, getDistanceMeters, type GeoCoordinates } from "@/utils/geo";
import {
    getDb,
    type FirestoreDocRecord,
    isDocumentReference,
} from "./firestoreGatewayUtils";

const NEARBY_CRAWLS_DEFAULT_LIMIT = 50;


function getPossibleRefString(refOrStr: unknown) {
    if (typeof refOrStr === "string") return refOrStr;
    if (isDocumentReference(refOrStr)) return `/${refOrStr.path}`
    return "";
}

function normalizeUserId(referencePathOrId: string): string {
    if (!referencePathOrId) {
        return "";
    }

    return referencePathOrId.split("/").filter(Boolean).at(-1) ?? "";
}

function normalizeCrawlId(referencePathOrId: string): string {
    if (!referencePathOrId) {
        return "";
    }

    return referencePathOrId.split("/").filter(Boolean).at(-1) ?? "";
}

function toUserDocumentReference(userReferencePathOrId: string) {
    const userId = normalizeUserId(userReferencePathOrId);
    return doc(getDb(), "users", userId);
}

function toCrawlDocumentReference(crawlReferencePathOrId: string) {
    const crawlId = normalizeCrawlId(crawlReferencePathOrId);
    return doc(getDb(), "crawls", crawlId);
}

function toFirestoreCrawlWriteDoc(crawl: FirestoreCrawlDoc) {
    return {
        ...crawl,
        createdBy: toUserDocumentReference(crawl.createdBy),
        participants: crawl.participants
            .map(toUserDocumentReference)
            .filter((participantRef) => Boolean(participantRef.id)),
    };
}

function toCrawlDoc(data: DocumentData): FirestoreCrawlDoc {
    return {
        crawlName: typeof data.crawlName === "string" ? data.crawlName : "",
        createdBy: getPossibleRefString(data.createdBy),
        lastStopLat: typeof data.lastStopLat === "number" ? data.lastStopLat : null,
        lastStopLng: typeof data.lastStopLng === "number" ? data.lastStopLng : null,
        isActive: Boolean(data.isActive),
        isPublic: Boolean(data.isPublic),
        participants: Array.isArray(data.participants)
            ? data.participants
                  .map((participant) => {
                      if (typeof participant === "string") {
                          return participant;
                      }

                      if (isDocumentReference(participant)) {
                          return `/${participant.path}`;
                      }

                      return "";
                  })
                  .filter(Boolean)
            : [],
    };
}

function toStopDoc(data: DocumentData): FirestoreStopDoc {
    const coordinates =
        data.coordinates &&
        typeof data.coordinates.latitude === "number" &&
        typeof data.coordinates.longitude === "number"
            ? {
                  latitude: data.coordinates.latitude,
                  longitude: data.coordinates.longitude,
              }
            : undefined;

    return {
        pubName: data.pubName ?? "",
        notes: data.notes ?? "",
        visitedOn: data.visitedOn?.toMillis?.() ?? Date.now(),
        coordinates,
    };
}

function toFirestoreStopWriteDoc(stop: FirestoreStopDoc) {
    if (!stop.coordinates) {
        return {
            pubName: stop.pubName,
            notes: stop.notes,
        };
    }

    return {
        pubName: stop.pubName,
        notes: stop.notes,
        coordinates: new GeoPoint(stop.coordinates.latitude, stop.coordinates.longitude),
        visitedOn: Timestamp.fromMillis(stop.visitedOn),
    };
}

function toCrawlMediaDoc(data: DocumentData): FirestoreCrawlMediaDoc {
    return {
        url: typeof data.url === "string" ? data.url : "",
        uploadedBy: getPossibleRefString(data.uploadedBy),
    };
}

function isImageMediaData(data: DocumentData): boolean {
    // Skip any pre-existing video media docs now that videos are no longer supported.
    return data.resourceType !== "video";
}

function toNearbyCrawlEntity(
    crawlRecord: FirestoreDocRecord<FirestoreCrawlDoc>,
    distanceMeters: number
): NearbyCrawlEntity | null {
    const { data } = crawlRecord;

    if (typeof data.lastStopLat !== "number" || typeof data.lastStopLng !== "number") {
        return null;
    }

    return {
        id: crawlRecord.id,
        crawlName: data.crawlName,
        lastStopLat: data.lastStopLat,
        lastStopLng: data.lastStopLng,
        participantCount: Array.isArray(data.participants) ? data.participants.length : 0,
        distanceMeters,
    };
}

export async function fetchCrawlById(
    crawlId: string
): Promise<FirestoreDocRecord<FirestoreCrawlDoc> | null> {
    if (!crawlId) return null;

    const crawlDocument = doc(getDb(), "crawls", crawlId);
    const crawlSnapshot = await getDoc(crawlDocument);

    if (!crawlSnapshot.exists()) return null;

    return {
        id: crawlSnapshot.id,
        data: toCrawlDoc(crawlSnapshot.data()),
    };
}

export function listenToCrawlDocument(
    crawlId: string,
    onData: (record: FirestoreDocRecord<FirestoreCrawlDoc> | null) => void,
    onError: (error: Error) => void
): () => void {
    const crawlDocument = doc(getDb(), "crawls", crawlId);

    return onSnapshot(
        crawlDocument,
        (snapshot) => {
            if (!snapshot.exists()) {
                onData(null);
                return;
            }

            onData({
                id: snapshot.id,
                data: toCrawlDoc(snapshot.data()),
            });
        },
        (error) => {
            onError(error);
        }
    );
}

export function listenToStopsForCrawl(
    crawlId: string,
    onData: (records: FirestoreDocRecord<FirestoreStopDoc>[]) => void,
    onError: (error: Error) => void
): () => void {
    const stopsCollection = collection(getDb(), "crawls", crawlId, "stops");

    return onSnapshot(
        query(stopsCollection),
        (snapshot) => {
            onData(
                snapshot.docs.map((stopDocument) => ({
                    id: stopDocument.id,
                    data: toStopDoc(stopDocument.data()),
                }))
            );
        },
        (error) => {
            onError(error);
        }
    );
}

export async function fetchStopsForCrawl(
    crawlId: string
): Promise<FirestoreDocRecord<FirestoreStopDoc>[]> {
    if (!crawlId) return [];

    const stopsCollection = collection(getDb(), "crawls", crawlId, "stops");
    const stopsSnapshot = await getDocs(query(stopsCollection));

    return stopsSnapshot.docs.map((stopDocument) => ({
        id: stopDocument.id,
        data: toStopDoc(stopDocument.data()),
    }));
}

export async function fetchMediaForCrawl(
    crawlId: string
): Promise<FirestoreDocRecord<FirestoreCrawlMediaDoc>[]> {
    if (!crawlId) return [];

    const mediaCollection = collection(getDb(), "crawls", crawlId, "media");
    const mediaSnapshot = await getDocs(query(mediaCollection));

    return mediaSnapshot.docs
        .filter((mediaDocument) => isImageMediaData(mediaDocument.data()))
        .map((mediaDocument) => ({
            id: mediaDocument.id,
            data: toCrawlMediaDoc(mediaDocument.data()),
        }));
}

export function listenToMediaForCrawl(
    crawlId: string,
    onData: (records: FirestoreDocRecord<FirestoreCrawlMediaDoc>[]) => void,
    onError: (error: Error) => void
): () => void {
    const mediaCollection = collection(getDb(), "crawls", crawlId, "media");

    return onSnapshot(
        query(mediaCollection),
        (snapshot) => {
            onData(
                snapshot.docs
                    .filter((mediaDocument) => isImageMediaData(mediaDocument.data()))
                    .map((mediaDocument) => ({
                        id: mediaDocument.id,
                        data: toCrawlMediaDoc(mediaDocument.data()),
                    }))
            );
        },
        (error) => {
            onError(error);
        }
    );
}

export async function fetchActiveCrawlForUser(
    userId: string
): Promise<FirestoreDocRecord<FirestoreCrawlDoc> | null> {
    if (!userId) return null;

    const db = getDb();
    const userReference = doc(db, "users", userId);

    const userSnapshot = await getDoc(userReference);
    if (userSnapshot.exists()) {
        const activeCrawlPath = getPossibleRefString(userSnapshot.data().activeCrawl);
        const activeCrawlId = normalizeCrawlId(activeCrawlPath);

        if (activeCrawlId) {
            const crawlDocument = doc(db, "crawls", activeCrawlId);
            const crawlSnapshot = await getDoc(crawlDocument);

            if (crawlSnapshot.exists()) {
                const crawlRecord = {
                    id: crawlSnapshot.id,
                    data: toCrawlDoc(crawlSnapshot.data()),
                };

                if (crawlRecord.data.isActive) {
                    return crawlRecord;
                }

                await setUserActiveCrawl(userId, null);
            }
        }
    }
    return null;
}

export async function fetchCrawlHistoryForUser(
    userId: string
): Promise<FirestoreDocRecord<FirestoreCrawlDoc>[]> {
    if (!userId) {
        return [];
    }

    const db = getDb();
    const userReference = doc(db, "users", userId);
    const crawlsCollection = collection(db, "crawls");

    const participantPathSnapshot = await getDocs(
        query(
            crawlsCollection,
            where("participants", "array-contains", userReference),
            where("isActive", "==", false)
        )
    );

    const crawlById = new Map<string, FirestoreDocRecord<FirestoreCrawlDoc>>();

    for (const crawlDocument of participantPathSnapshot.docs) {
        crawlById.set(crawlDocument.id, {
            id: crawlDocument.id,
            data: toCrawlDoc(crawlDocument.data()),
        });
    }

    return Array.from(crawlById.values());
}

export async function createCrawlWithStops(
    crawl: FirestoreCrawlDoc,
    stops: FirestoreStopDoc[]
): Promise<{
    crawl: FirestoreDocRecord<FirestoreCrawlDoc>;
    stops: FirestoreDocRecord<FirestoreStopDoc>[];
}> {
    const db = getDb();
    const crawlsCollection = collection(db, "crawls");
    const crawlDocument = doc(crawlsCollection);
    const stopsCollection = collection(db, "crawls", crawlDocument.id, "stops");
    const batch = writeBatch(db);

    batch.set(crawlDocument, toFirestoreCrawlWriteDoc(crawl));

    const createdStops = stops.map((stop) => {
        const stopDocument = doc(stopsCollection);
        batch.set(stopDocument, toFirestoreStopWriteDoc(stop));

        return {
            id: stopDocument.id,
            data: stop,
        };
    });

    await batch.commit();

    return {
        crawl: {
            id: crawlDocument.id,
            data: crawl,
        },
        stops: createdStops,
    };
}

export async function createStopForCrawl(
    crawlId: string,
    stop: FirestoreStopDoc
): Promise<FirestoreDocRecord<FirestoreStopDoc>> {
    const stopsCollection = collection(getDb(), "crawls", crawlId, "stops");
    const createdStopDocument = await addDoc(stopsCollection, toFirestoreStopWriteDoc(stop));

    return {
        id: createdStopDocument.id,
        data: stop,
    };
}

export async function updateCrawl(
    crawlId: string,
    updates: Partial<FirestoreCrawlDoc>
): Promise<void> {
    if (!crawlId) {
        return;
    }

    const crawlDocument = doc(getDb(), "crawls", crawlId);

    const normalizedUpdates: Record<string, unknown> = { ...updates };

    if (typeof updates.createdBy === "string") {
        normalizedUpdates.createdBy = toUserDocumentReference(updates.createdBy);
    }

    if (Array.isArray(updates.participants)) {
        normalizedUpdates.participants = updates.participants
            .map(toUserDocumentReference)
            .filter((participantRef) => Boolean(participantRef.id));
    }

    await updateDoc(crawlDocument, normalizedUpdates);
}

export async function updateStopForCrawl(
    crawlId: string,
    stopId: string,
    updates: Partial<FirestoreStopDoc>
): Promise<void> {
    if (!crawlId || !stopId) {
        return;
    }

    const stopDocument = doc(getDb(), "crawls", crawlId, "stops", stopId);
    const normalizedUpdates: Record<string, unknown> = { ...updates };

    if (updates.coordinates) {
        normalizedUpdates.coordinates = new GeoPoint(
            updates.coordinates.latitude,
            updates.coordinates.longitude
        );
    }
    
    if (typeof normalizedUpdates.visitedOn === "number") {
        normalizedUpdates.visitedOn = Timestamp.fromMillis(normalizedUpdates.visitedOn);
    }
    
    await updateDoc(stopDocument, normalizedUpdates);
}

export async function addParticipantToCrawl(
    crawlId: string,
    userReferencePath: string
): Promise<void> {
    if (!crawlId || !userReferencePath) {
        return;
    }

    const crawlDocument = doc(getDb(), "crawls", crawlId);
    await updateDoc(crawlDocument, {
        participants: arrayUnion(toUserDocumentReference(userReferencePath)),
    });
}

export async function setUserActiveCrawl(userId: string, crawlId: string | null): Promise<void> {
    if (!userId) {
        return;
    }

    const userDocument = doc(getDb(), "users", userId);
    await setDoc(
        userDocument,
        {
            activeCrawl: crawlId ? toCrawlDocumentReference(crawlId) : null,
        },
        { merge: true }
    );
}

export async function clearActiveCrawlForUsers(
    crawlId: string,
    userIds: string[]
): Promise<void> {
    if (!crawlId || userIds.length === 0) {
        return;
    }

    const db = getDb();
    const maxBatchSize = 400;
    const maxReadBatchSize = 5; // Parallel reads

    for (let start = 0; start < userIds.length; start += maxBatchSize) {
        const chunk = userIds.slice(start, start + maxBatchSize);

        // Fetch all user documents in parallel batches (avoiding rate limits)
        const userDocs: Map<string, DocumentSnapshot<DocumentData>> = new Map();

        for (let readStart = 0; readStart < chunk.length; readStart += maxReadBatchSize) {
            const readChunk = chunk.slice(readStart, readStart + maxReadBatchSize);
            const docPromises = readChunk.map(userId =>
                getDoc(doc(db, "users", userId))
            );

            const docs = await Promise.all(docPromises);
            readChunk.forEach((userId, idx) => {
                userDocs.set(userId, docs[idx]);
            });
        }

        const batch = writeBatch(db);
        let hasWrites = false;

        for (const [userId, userSnapshot] of userDocs.entries()) {
            if (!userSnapshot.exists()) {
                continue;
            }

            const activeCrawlPath = getPossibleRefString(userSnapshot.data().activeCrawl);
            const activeCrawlId = normalizeCrawlId(activeCrawlPath);

            if (crawlId === activeCrawlId) {
                batch.update(doc(db, "users", userId), { activeCrawl: null });
                hasWrites = true;
            }
        }

        if (hasWrites) {
            await batch.commit();
        }
    }
}

export async function createMediaForCrawl(
    crawlId: string,
    media: FirestoreCrawlMediaDoc
): Promise<FirestoreDocRecord<FirestoreCrawlMediaDoc>> {
    const mediaCollection = collection(getDb(), "crawls", crawlId, "media");
    const writeDoc = {
        url: media.url,
        uploadedBy: toUserDocumentReference(media.uploadedBy),
    };
    const createdMediaDocument = await addDoc(mediaCollection, writeDoc);

    return {
        id: createdMediaDocument.id,
        data: media,
    };
}

export async function fetchNearbyCrawls(
    center: GeoCoordinates,
    radiusMeters = 4000,
    maxResults = NEARBY_CRAWLS_DEFAULT_LIMIT
): Promise<NearbyCrawlEntity[]> {
    const db = getDb();
    const crawlsCollection = collection(db, "crawls");
    const { minLat, maxLat, minLng, maxLng } = getBoundingBox(center, radiusMeters);

    const crawlsSnapshot = await getDocs(
        query(
            crawlsCollection,
            where("isPublic", "==", true),
            where("isActive", "==", true),
            where("lastStopLat", ">=", minLat),
            where("lastStopLat", "<=", maxLat),
            limit(Math.max(maxResults * 2, maxResults))
        )
    );

    return crawlsSnapshot.docs
        .map((crawlDocument) => ({
            id: crawlDocument.id,
            data: toCrawlDoc(crawlDocument.data()),
        }))
        .filter((crawlRecord) =>
            typeof crawlRecord.data.lastStopLat === "number" &&
            typeof crawlRecord.data.lastStopLng === "number" &&
            crawlRecord.data.lastStopLng >= minLng &&
            crawlRecord.data.lastStopLng <= maxLng
        )
        .map((crawlRecord) => {
            const lastStopLat = crawlRecord.data.lastStopLat;
            const lastStopLng = crawlRecord.data.lastStopLng;

            if (typeof lastStopLat !== "number" || typeof lastStopLng !== "number") {
                return null;
            }

            const distanceMeters = getDistanceMeters(center, {
                latitude: lastStopLat,
                longitude: lastStopLng,
            });

            return toNearbyCrawlEntity(
                {
                    id: crawlRecord.id,
                    data: {
                        ...crawlRecord.data,
                        lastStopLat,
                        lastStopLng,
                    },
                },
                distanceMeters
            );
        })
        .filter((crawl): crawl is NearbyCrawlEntity => Boolean(crawl))
        .filter((crawl) => crawl.distanceMeters <= radiusMeters)
        .sort((left, right) => left.distanceMeters - right.distanceMeters)
        .slice(0, maxResults);
}
