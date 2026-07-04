import { ReactElement } from "react";
import { useLocalSearchParams } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { ViewCrawlStopView } from "@/views/viewCrawlStopView";
import { useCrawlStop } from "@/hooks/useCrawlStop";

export function ViewCrawlStopPresenter(): ReactElement {
    const { crawlUid, stopUid, update } = useLocalSearchParams<{
        crawlUid?: string;
        stopUid?: string;
        update?: string;
    }>();
    const isFocused = useIsFocused();

    const shouldUpdate = update === "true";
    const normalizedCrawlUid = crawlUid ?? "";
    const normalizedStopId = stopUid ?? "";
    const { stop, isLoading: isStopLoading } = useCrawlStop({
        crawlId: normalizedCrawlUid,
        stopId: normalizedStopId,
        isFocused,
        shouldUpdate,
    });

    return (
        <ViewCrawlStopView
            isLoading={isStopLoading}
            stopName={stop?.pubName ?? ""}
            notes={stop?.notes ?? ""}
            stopCoordinates={stop?.coordinates}
            visitedOn={stop?.visitedOn}
        />
    );
}
