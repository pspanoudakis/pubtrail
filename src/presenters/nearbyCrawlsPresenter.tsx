import { ReactElement, useCallback, useEffect } from "react";
import { router } from "expo-router";
import { NearbyCrawlsView } from "@/views/nearbyCrawlsView";
import { useAppDispatch, useAppSelector } from "@/redux/store/hooks";
import { loadNearbyCrawls } from "@/redux/actions/nearbyCrawlsActions";
import {
    selectNearbyCrawls,
    selectNearbyCrawlsError,
    selectNearbyCrawlsLoading,
} from "@/redux/selectors/nearbyCrawlsSelectors";
import type { NearbyCrawlEntity } from "@/redux/types/crawlTypes";

function formatDistance(distanceMeters: number): string {
    if (distanceMeters < 1000) {
        return `${Math.round(distanceMeters)} m away`;
    }

    return `${(distanceMeters / 1000).toFixed(distanceMeters < 10000 ? 1 : 0)} km away`;
}

export function NearbyCrawlsPresenter(): ReactElement {
    const dispatch = useAppDispatch();
    const userLocation = useAppSelector((state) => state.map.userLocation);
    const crawls = useAppSelector(selectNearbyCrawls);
    const isLoading = useAppSelector(selectNearbyCrawlsLoading);
    const error = useAppSelector(selectNearbyCrawlsError);
    const isRefreshing = isLoading && crawls.length > 0;
    const isInitialLoading = isLoading && crawls.length === 0;

    const refreshNearbyCrawls = useCallback(() => {
        void dispatch(loadNearbyCrawls(userLocation));
    }, [dispatch, userLocation]);

    useEffect(() => {
        refreshNearbyCrawls();
    }, [refreshNearbyCrawls]);

    const viewCrawls = crawls.map((crawl: NearbyCrawlEntity) => ({
        id: crawl.id,
        title: crawl.crawlName,
        participants: `${crawl.participantCount} participant${crawl.participantCount === 1 ? "" : "s"}`,
        distance: formatDistance(crawl.distanceMeters),
    }));

    return (
        <NearbyCrawlsView
            crawls={viewCrawls}
            isLoading={isInitialLoading}
            isRefreshing={isRefreshing}
            errorMessage={error}
            onRefresh={refreshNearbyCrawls}
            onSelectCrawl={(crawlUid) =>
                router.navigate({
                    pathname: "/viewCrawl/[crawlUid]",
                    params: { crawlUid, update: "true" },
                })
            }
        />
    );
}
