import { useEffect, useState } from "react";
import {
    fetchStopsForCrawl,
    listenToStopsForCrawl,
} from "@/redux/gateways/activeCrawlGateway";
import type { FirestoreStopDoc } from "@/redux/types/crawlTypes";

type UseCrawlStopOptions = {
    crawlId: string;
    stopId: string;
    isFocused: boolean;
    shouldUpdate: boolean;
    fetchWhenNotUpdating?: boolean;
};

type UseCrawlStopResult = {
    stop: FirestoreStopDoc | null;
    isLoading: boolean;
};

export function useCrawlStop({
    crawlId,
    stopId,
    isFocused,
    shouldUpdate,
    fetchWhenNotUpdating = true,
}: UseCrawlStopOptions): UseCrawlStopResult {
    const [stop, setStop] = useState<FirestoreStopDoc | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const shouldFetch = shouldUpdate || fetchWhenNotUpdating;

        if (!crawlId || !stopId || !shouldFetch) {
            setStop(null);
            setIsLoading(false);
            return;
        }

        if (!isFocused) {
            setIsLoading(false);
            return;
        }

        let isDisposed = false;
        setIsLoading(true);

        fetchStopsForCrawl(crawlId)
            .then((stopRecords) => {
                if (isDisposed) {
                    return;
                }

                const foundStop = stopRecords.find((record) => record.id === stopId);
                setStop(foundStop?.data ?? null);
            })
            .catch(() => {
                if (isDisposed) {
                    return;
                }

                setStop(null);
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

        const stopStopsListener = listenToStopsForCrawl(
            crawlId,
            (stopRecords) => {
                const foundStop = stopRecords.find((record) => record.id === stopId);
                setStop(foundStop?.data ?? null);
            },
            () => {
                // Keep previous state on transient snapshot errors.
            }
        );

        return () => {
            isDisposed = true;
            stopStopsListener();
        };
    }, [crawlId, fetchWhenNotUpdating, isFocused, shouldUpdate, stopId]);

    return { stop, isLoading };
}
