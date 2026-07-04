import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/redux/store/store";
import type { ActiveCrawlScreenModel } from "@/redux/types/crawlTypes";
import { selectLoggedInUserUid } from "./authSelectors";
import { sortStopsChronologically } from "@/utils/sortStops";

export function selectActiveCrawl(state: RootState) {
    return state.activeCrawl;
}

export function selectHasActiveCrawl(state: RootState): boolean {
    return Boolean(state.activeCrawl);
}

export const selectActiveCrawlScreenModel = createSelector(
    [selectActiveCrawl, selectLoggedInUserUid],
    (activeCrawl, thisUserUid): ActiveCrawlScreenModel => {
        if (!activeCrawl) {
            return {
                title: "No Active Crawl",
                isOwner: false,
                participantIds: [],
                stops: [],
                isPublic: false
            };
        }

        return {
            title: activeCrawl.crawlName,
            isOwner: thisUserUid ? activeCrawl.creatorUserId === thisUserUid : false,
            participantIds: activeCrawl.participantIds,
            stops: [...activeCrawl.stops].sort(sortStopsChronologically).map(
                (stop) => ({
                    id: stop.id,
                    pubName: stop.pubName,
                    visitedOn: stop.visitedOn,
                    coordinates: stop.coordinates,
                })
            ),
            isPublic: activeCrawl.isPublic
        };
    }
);
