import { useCallback, useEffect, useState } from "react";
import { useAppDispatch } from "@/redux/store/hooks";
import {
    refreshLoggedUserActiveCrawlOnce,
    stopLoggedUserActiveCrawlSync,
} from "@/redux/actions/activeCrawlActions";

type UseActiveCrawlRefreshOptions = {
    isActiveMode: boolean;
    isFocused?: boolean;
};

type UseActiveCrawlRefreshResult = {
    isRefreshing: boolean;
    isEntryLoading: boolean;
    refreshActiveCrawl: (showSpinner?: boolean, markAsEntryLoad?: boolean) => Promise<void>;
};

export function useActiveCrawlRefresh({
    isActiveMode,
    isFocused = true,
}: UseActiveCrawlRefreshOptions): UseActiveCrawlRefreshResult {
    const dispatch = useAppDispatch();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isEntryLoading, setIsEntryLoading] = useState(isActiveMode);

    useEffect(() => {
        setIsEntryLoading(isActiveMode);
    }, [isActiveMode]);

    const refreshActiveCrawl = useCallback(
        async (showSpinner = true, markAsEntryLoad = false) => {
            if (!isActiveMode || !isFocused) {
                if (markAsEntryLoad) {
                    setIsEntryLoading(false);
                }

                return;
            }

            if (showSpinner) {
                setIsRefreshing(true);
            }

            if (markAsEntryLoad) {
                setIsEntryLoading(true);
            }

            dispatch(stopLoggedUserActiveCrawlSync());

            try {
                await dispatch(refreshLoggedUserActiveCrawlOnce());
            } finally {
                if (showSpinner) {
                    setIsRefreshing(false);
                }

                if (markAsEntryLoad) {
                    setIsEntryLoading(false);
                }
            }
        },
        [dispatch, isActiveMode, isFocused]
    );

    return { isRefreshing, isEntryLoading, refreshActiveCrawl };
}
