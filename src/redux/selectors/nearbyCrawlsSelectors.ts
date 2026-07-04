import type { RootState } from "@/redux/store/store";

export function selectNearbyCrawls(state: RootState) {
    return state.nearbyCrawls.crawls;
}

export function selectNearbyCrawlsLoading(state: RootState) {
    return state.nearbyCrawls.isLoading;
}

export function selectNearbyCrawlsError(state: RootState) {
    return state.nearbyCrawls.error;
}