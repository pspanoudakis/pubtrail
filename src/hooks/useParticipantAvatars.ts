import { useEffect, useMemo, useState } from "react";
import { fetchUserById } from "@/redux/gateways/userGateway";

type UseParticipantAvatarsOptions = {
    participantIdsKey: string;
    isFocused: boolean;
    shouldUpdate: boolean;
    fetchWhenNotUpdating?: boolean;
};

type UseParticipantAvatarsResult = {
    avatarUrls: string[];
    isLoading: boolean;
};

export function useParticipantAvatars({
    participantIdsKey,
    isFocused,
    shouldUpdate,
    fetchWhenNotUpdating = true,
}: UseParticipantAvatarsOptions): UseParticipantAvatarsResult {
    const [avatarUrls, setAvatarUrls] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [resolvedParticipantIdsKey, setResolvedParticipantIdsKey] = useState("");

    const memoizedParticipantIds = useMemo(
        () => (participantIdsKey ? participantIdsKey.split("|").filter(Boolean) : []),
        [participantIdsKey]
    );

    const shouldFetch = shouldUpdate || fetchWhenNotUpdating;
    const isFetchEligible = Boolean(
        participantIdsKey && memoizedParticipantIds.length && shouldFetch && isFocused
    );
    const isLoadingForCurrentParticipantIds =
        isLoading || (isFetchEligible && resolvedParticipantIdsKey !== participantIdsKey);

    useEffect(() => {
        if (!memoizedParticipantIds.length || !shouldFetch) {
            setAvatarUrls([]);
            setIsLoading(false);
            setResolvedParticipantIdsKey(participantIdsKey);
            return;
        }

        if (!isFocused) {
            setIsLoading(false);
            return;
        }

        let isDisposed = false;
        setIsLoading(true);

        void (async () => {
            try {
                const users = await Promise.all(
                    memoizedParticipantIds.map(async (participantId) => {
                        try {
                            return await fetchUserById(participantId);
                        } catch {
                            return null;
                        }
                    })
                );

                if (isDisposed) {
                    return;
                }
                setAvatarUrls(
                    users.map((userRecord) => userRecord?.data.avatarUrl ?? "")
                );
                setResolvedParticipantIdsKey(participantIdsKey);
            } catch {
                if (isDisposed) {
                    return;
                }

                setAvatarUrls([]);
                setResolvedParticipantIdsKey(participantIdsKey);
            } finally {
                if (isDisposed) {
                    return;
                }

                setIsLoading(false);
            }
        })();

        return () => {
            isDisposed = true;
        };
    }, [isFocused, memoizedParticipantIds, participantIdsKey, shouldFetch]);

    return { avatarUrls, isLoading: isLoadingForCurrentParticipantIds };
}
