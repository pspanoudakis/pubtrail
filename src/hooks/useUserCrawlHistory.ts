import { useEffect, useState } from "react";
import {
    fetchCrawlHistoryForUser,
    fetchStopsForCrawl,
} from "@/redux/gateways/activeCrawlGateway";
import { CrawlHistoryItem } from "../types/crawlHistoryItem";

type UseUserCrawlHistoryOptions = {
    userId: string;
    isFocused: boolean;
};

type UseUserCrawlHistoryResult = {
    crawls: CrawlHistoryItem[];
    isLoading: boolean;
};

export function useUserCrawlHistory({
    userId,
    isFocused,
}: UseUserCrawlHistoryOptions): UseUserCrawlHistoryResult {
    const [crawls, setCrawls] = useState<CrawlHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!userId) {
            setCrawls([]);
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
                const crawlRecords = await fetchCrawlHistoryForUser(userId);
                const historyCrawls: CrawlHistoryItem[] = await Promise.all(
                    crawlRecords.map(async (crawlRecord) => {
                        return {
                            id: crawlRecord.id,
                            title: crawlRecord.data.crawlName,
                            date: 'Finished crawl',
                            participants: crawlRecord.data.participants.length,
                            visitedPubs: (await fetchStopsForCrawl(crawlRecord.id)).length,
                        }
                    })
                );
                if (isDisposed) return;
                setCrawls(historyCrawls);
            } catch {
                if (isDisposed) return;
                setCrawls([]);
            } finally {
                if (isDisposed) return;
                setIsLoading(false);
            }
        })();

        return () => {
            isDisposed = true;
        };
    }, [isFocused, userId]);

    return { crawls, isLoading };
}
