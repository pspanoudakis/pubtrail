import type { NearbyCrawlsState } from "@/redux/types/crawlTypes";

const initialState: NearbyCrawlsState = {
    crawls: [],
    isLoading: false,
    error: null,
};

type NearbyCrawlsAction =
    | { type: "NEARBY_CRAWLS_SET"; payload: NearbyCrawlsState["crawls"] }
    | { type: "NEARBY_CRAWLS_LOADING" }
    | { type: "NEARBY_CRAWLS_ERROR"; payload: string }
    | { type: "NEARBY_CRAWLS_CLEAR" };

const nearbyCrawlsReducer = (
    state = initialState,
    action: NearbyCrawlsAction
): NearbyCrawlsState => {
    switch (action.type) {
        case "NEARBY_CRAWLS_SET":
            return {
                crawls: action.payload,
                isLoading: false,
                error: null,
            };
        case "NEARBY_CRAWLS_LOADING":
            return {
                ...state,
                isLoading: true,
                error: null,
            };
        case "NEARBY_CRAWLS_ERROR":
            return {
                ...state,
                isLoading: false,
                error: action.payload,
            };
        case "NEARBY_CRAWLS_CLEAR":
            return initialState;
        default:
            return state;
    }
};

export default nearbyCrawlsReducer;