import { ReactElement } from "react";
import { router } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { CrawlHistoryView } from "@/views/crawlHistoryView";
import { useAppSelector } from "@/redux/store/hooks";
import { useUserCrawlHistory } from "@/hooks/useUserCrawlHistory";

export function CrawlHistoryPresenter(): ReactElement {
    const isFocused = useIsFocused();
    const loggedUserId = useAppSelector((state) => state.auth.user?.uid ?? "");
    const { crawls, isLoading } = useUserCrawlHistory({
        userId: loggedUserId,
        isFocused,
    });

    return (
        <CrawlHistoryView
            isLoading={isLoading}
            crawls={crawls}
            onSelectCrawl={(crawlUid) =>
                router.navigate({
                    pathname: "/viewCrawl/[crawlUid]",
                    params: { crawlUid, update: "true" },
                })
            }
            onNewPubCrawl={() => router.navigate("/newCrawl")}
        />
    );
}
