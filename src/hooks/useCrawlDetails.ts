import { useEffect, useState } from "react";
import {
    fetchCrawlById,
    fetchStopsForCrawl,
    listenToCrawlDocument,
    listenToStopsForCrawl,
} from "@/redux/gateways/activeCrawlGateway";
import {
    mapFirestoreCrawlToEntity,
    mapFirestoreStopToEntity,
} from "@/redux/mappers/activeCrawlMappers";
import type { ActiveCrawlEntity } from "@/redux/types/crawlTypes";
import { sortStopsChronologically } from "@/utils/sortStops";

type UseCrawlDetailsOptions = {
    crawlId: string;
    isFocused: boolean;
    shouldUpdate: boolean;
    fetchWhenNotUpdating?: boolean;
};

type UseCrawlDetailsResult = {
    crawl: ActiveCrawlEntity | null;
    isLoading: boolean;
};

export function useCrawlDetails({
    crawlId,
    isFocused,
    shouldUpdate,
    fetchWhenNotUpdating = true,
}: UseCrawlDetailsOptions): UseCrawlDetailsResult {
    const [crawl, setCrawl] = useState<ActiveCrawlEntity | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const shouldFetch = shouldUpdate || fetchWhenNotUpdating;

        if (!crawlId || !shouldFetch) {
            setCrawl(null);
            setIsLoading(false);
            return;
        }

        if (!isFocused) {
            setIsLoading(false);
            return;
        }

        let isDisposed = false;
        setIsLoading(true);

        void (async () => {
            try {
                const [crawlRecord, stopRecords] = await Promise.all([
                    fetchCrawlById(crawlId),
                    fetchStopsForCrawl(crawlId),
                ]);

                if (isDisposed) {
                    return;
                }

                if (!crawlRecord) {
                    setCrawl(null);
                    return;
                }

                const fetchedCrawl = mapFirestoreCrawlToEntity(crawlRecord.id, crawlRecord.data);
                setCrawl({
                    ...fetchedCrawl,
                    stops: stopRecords
                        .map((stopRecord) => mapFirestoreStopToEntity(stopRecord.id, stopRecord.data))
                        .sort(sortStopsChronologically),
                });
            } catch {
                if (isDisposed) {
                    return;
                }

                setCrawl(null);
            } finally {
                if (isDisposed) {
                    return;
                }

                setIsLoading(false);
            }
        })();

        if (!shouldUpdate) {
            return () => {
                isDisposed = true;
            };
        }

        const stopCrawlListener = listenToCrawlDocument(
            crawlId,
            (crawlRecord) => {
                if (!crawlRecord) {
                    setCrawl(null);
                    return;
                }

                setCrawl((currentCrawl) => {
                    const nextCrawl = mapFirestoreCrawlToEntity(crawlRecord.id, crawlRecord.data);
                    return {
                        ...nextCrawl,
                        stops: currentCrawl?.id === nextCrawl.id ? currentCrawl.stops : [],
                    };
                });
            },
            () => {
                // Keep previous state on transient snapshot errors for this simplified flow.
            }
        );

        const stopStopsListener = listenToStopsForCrawl(
            crawlId,
            (stopRecords) => {
                setCrawl((currentCrawl) => {
                    if (!currentCrawl || currentCrawl.id !== crawlId) {
                        return currentCrawl;
                    }

                    return {
                        ...currentCrawl,
                        stops: stopRecords
                            .map((stopRecord) => mapFirestoreStopToEntity(
                                stopRecord.id, stopRecord.data
                            ))
                            .sort(sortStopsChronologically),
                    };
                });
            },
            () => {
                // Keep previous state on transient snapshot errors for this simplified flow.
            }
        );

        return () => {
            isDisposed = true;
            stopCrawlListener();
            stopStopsListener();
        };
    }, [crawlId, fetchWhenNotUpdating, isFocused, shouldUpdate]);

    return { crawl, isLoading };
}
