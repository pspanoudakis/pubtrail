import { ReactElement, useEffect } from "react";
import { CrawlDetailsView } from "../views/crawlDetailsView";
import { useIsFocused } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useCrawlDetails } from "@/hooks/useCrawlDetails";
import { useParticipantIdsKey } from "@/hooks/useParticipantIdsKey";
import { useParticipantAvatars } from "@/hooks/useParticipantAvatars";
import { useCrawlMediaItems } from "@/hooks/useCrawlMediaItems";
import { useAppDispatch, useAppSelector } from "@/redux/store/hooks";
import { requestLocationPermission } from "@/redux/actions/mapActions";
import { selectLoggedInUserUid } from "@/redux/selectors/authSelectors";

export function CrawlDetailsPresenter(): ReactElement {
    const { crawlUid, update } = useLocalSearchParams<{ crawlUid?: string; update?: string }>();
    const isFocused = useIsFocused();
    const dispatch = useAppDispatch();
    const { userLocation, defaultLocation, locationPermissionGranted } = useAppSelector((state) => state.map);
    const loggedUserUid = useAppSelector(selectLoggedInUserUid);

    const shouldUpdate = update === "true";
    const normalizedCrawlUid = crawlUid ?? "";

    useEffect(() => {
        dispatch(requestLocationPermission());
    }, [dispatch]);

    const { crawl, isLoading } = useCrawlDetails({
        crawlId: normalizedCrawlUid,
        isFocused,
        shouldUpdate,
    });

    const participantIds = crawl?.participantIds ?? [];
    const participantIdsKey = useParticipantIdsKey(participantIds);
    const canAddMedia =
        Boolean(loggedUserUid) &&
        Boolean(crawl) &&
        (crawl?.creatorUserId === loggedUserUid ||
            participantIds.includes(loggedUserUid ?? ""));

    const { avatarUrls: participantAvatarUrls, isLoading: isAvatarsLoading } = useParticipantAvatars({
        participantIdsKey,
        isFocused,
        shouldUpdate,
    });

    const { mediaItems: crawlMediaItems } = useCrawlMediaItems({
        crawlId: normalizedCrawlUid,
        isFocused,
        shouldUpdate,
    });

    const stops = crawl?.stops.map((stop) => ({
        id: stop.id,
        pubName: stop.pubName,
        visitedOn: stop.visitedOn,
        coordinates: stop.coordinates,
    })) ?? [];

    return (
        <CrawlDetailsView
            isLoading={isLoading || isAvatarsLoading}
            title={crawl?.crawlName ?? "Crawl Not Found"}
            participants={participantIds.length}
            stops={stops}
            participantAvatarUrls={participantAvatarUrls}
            crawlMediaItems={crawlMediaItems}
            isLocationGranted={locationPermissionGranted}
            userLocation={userLocation ?? defaultLocation}
            onViewStop={(stopId: string) =>
                router.navigate({
                    pathname: "/viewCrawl/[crawlUid]/stops/[stopUid]",
                    params: {
                        crawlUid: normalizedCrawlUid,
                        stopUid: stopId,
                        update: shouldUpdate ? "true" : "false",
                    },
                })
            }
            onOpenAlbum={
                normalizedCrawlUid
                    ? (index: number) =>
                          router.navigate({
                              pathname: "/album/[crawlUid]",
                              params: {
                                  crawlUid: normalizedCrawlUid,
                                  index: String(index),
                              },
                          })
                    : undefined
            }
            onAddMedia={
                canAddMedia && normalizedCrawlUid
                    ? () =>
                          router.navigate({
                              pathname: "/activeCrawl/captureMedia",
                              params: { crawlId: normalizedCrawlUid },
                          })
                    : undefined
            }
        />
    );
}