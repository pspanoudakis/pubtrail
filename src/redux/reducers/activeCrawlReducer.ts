import type { ActiveCrawlEntity } from "@/redux/types/crawlTypes";

const initialState = null as ActiveCrawlEntity | null;

type ActiveCrawlAction =
    | { type: "ACTIVE_CRAWL_SET"; payload: ActiveCrawlEntity | null }
    | { type: "ACTIVE_CRAWL_CLEAR" };

const activeCrawlReducer = (
    state = initialState,
    action: ActiveCrawlAction
): ActiveCrawlEntity | null => {
    switch (action.type) {
        case "ACTIVE_CRAWL_SET":
            return action.payload;
        case "ACTIVE_CRAWL_CLEAR":
            return null;
        default:
            return state;
    }
};

export default activeCrawlReducer;