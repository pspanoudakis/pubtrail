import { ReactElement, useState } from "react";
import { Platform, Share } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAppSelector } from "@/redux/store/hooks";
import { selectActiveCrawlScreenModel } from "@/redux/selectors/activeCrawlSelectors";
import { ShareCrawlView } from "@/views/shareCrawlView";

export function ShareCrawlPresenter(): ReactElement {
    const params = useLocalSearchParams<{ crawlId?: string; crawlName?: string }>();
    const activeCrawl = useAppSelector(selectActiveCrawlScreenModel);
    const activeCrawlId = useAppSelector((state) => state.activeCrawl?.id ?? null);

    const crawlId =
        (typeof params.crawlId === "string" && params.crawlId) || activeCrawlId || null;
    const crawlName =
        (typeof params.crawlName === "string" && params.crawlName) ||
        (activeCrawl.title && activeCrawl.title !== "No Active Crawl" ? activeCrawl.title : null);

    const deepLink = crawlId
        ? `https://pubtrail-73421.web.app/join/${encodeURIComponent(crawlId)}`
        : null;

    const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
    const [isSharing, setIsSharing] = useState(false);

    return (
        <ShareCrawlView
            crawlId={crawlId}
            crawlName={crawlName}
            deepLink={deepLink}
            onCopyId={onCopyIdACB}
            copyFeedback={copyFeedback}
        />
    );

    function onCopyIdACB() {
        if (!deepLink || isSharing) {
            return;
        }

        // On web, copy to clipboard
        if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
            void navigator.clipboard.writeText(deepLink);
            setCopyFeedback("Crawl link copied to clipboard.");
            return;
        }

        // On native, use native sharing with deep link
        const message = `Join my pub crawl! ${deepLink}`;

        setIsSharing(true);
        void Share.share({
            message,
            title: "Join PubTrail Crawl",
        }).finally(() => {
            setIsSharing(false);
        });
    }
}
