import { useMemo } from "react";

export function useParticipantIdsKey(participantIds: string[]): string {
    return useMemo(() => participantIds.join("|"), [participantIds]);
}
