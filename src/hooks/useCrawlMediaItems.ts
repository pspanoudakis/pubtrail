import { useEffect, useState } from "react";
import {
    fetchMediaForCrawl,
    listenToMediaForCrawl,
} from "@/redux/gateways/activeCrawlGateway";
import { mapMediaRecordsToItems } from "@/redux/mappers/activeCrawlMappers";
import type { CrawlMediaItem } from "@/redux/types/crawlTypes";

type UseCrawlMediaItemsOptions = {
    crawlId: string;
    isFocused: boolean;
    shouldUpdate: boolean;
    fetchWhenNotUpdating?: boolean;
};

type UseCrawlMediaItemsResult = {
    mediaItems: CrawlMediaItem[];
    isLoading: boolean;
};

export function useCrawlMediaItems({
    crawlId,
    isFocused,
    shouldUpdate,
    fetchWhenNotUpdating = true,
}: UseCrawlMediaItemsOptions): UseCrawlMediaItemsResult {
    const [mediaItems, setMediaItems] = useState<CrawlMediaItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const shouldFetch = shouldUpdate || fetchWhenNotUpdating;

        if (!crawlId || !shouldFetch) {
            setMediaItems([]);
            setIsLoading(false);
            return;
        }

        if (!isFocused) {
            setIsLoading(false);
            return;
        }

        let isDisposed = false;
        setIsLoading(true);

        fetchMediaForCrawl(crawlId)
            .then((mediaRecords) => {
                if (isDisposed) {
                    return;
                }
                setMediaItems(mapMediaRecordsToItems(mediaRecords));
            })
            .catch(() => {
                // Keep previous media state on transient fetch errors.
            })
            .finally(() => {
                if (isDisposed) {
                    return;
                }
                setIsLoading(false);
            });

        if (!shouldUpdate) {
            return () => {
                isDisposed = true;
            };
        }

        const stopListener = listenToMediaForCrawl(
            crawlId,
            (mediaRecords) => {
                setMediaItems(mapMediaRecordsToItems(mediaRecords));
            },
            () => {
                // Keep previous media state on transient snapshot errors.
            }
        );

        return () => {
            isDisposed = true;
            stopListener();
        };
    }, [crawlId, fetchWhenNotUpdating, isFocused, shouldUpdate]);

    return { mediaItems, isLoading };
}
