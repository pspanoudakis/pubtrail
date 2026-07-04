import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/redux/store/store";
import { sortStopsChronologically } from "@/utils/sortStops";

const selectNewCrawlDraftStopsBase = (state: RootState) => state.newCrawlDraft.stops;

export const selectNewCrawlDraftStops = createSelector(
    [selectNewCrawlDraftStopsBase],
    (stops) => [...stops].sort(sortStopsChronologically)
);

export const selectNewCrawlDraftStopById = createSelector(
    [selectNewCrawlDraftStopsBase, (_: RootState, stopId: string) => stopId],
    (stops, stopId) => stops.find((stop) => stop.id === stopId) ?? null
);