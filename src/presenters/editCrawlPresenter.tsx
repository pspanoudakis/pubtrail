import { ReactElement, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import { router } from "expo-router";
import { EditCrawlView } from "@/views/editCrawlView";
import { useAppDispatch, useAppSelector } from "@/redux/store/hooks";
import { selectActiveCrawlScreenModel } from "@/redux/selectors/activeCrawlSelectors";
import {
    createLoggedUserPubCrawl,
    endLoggedUserActiveCrawl,
    leaveLoggedUserActiveCrawl,
    updateLoggedUserActiveCrawl,
} from "@/redux/actions/activeCrawlActions";
import { clearNewCrawlDraft } from "@/redux/actions/newCrawlDraftActions";
import { selectNewCrawlDraftStops } from "@/redux/selectors/newCrawlDraftSelectors";
import { useIsFocused } from "@react-navigation/native";
import { useActiveCrawlRefresh } from "@/hooks/useActiveCrawlRefresh";
import { useParticipantIdsKey } from "@/hooks/useParticipantIdsKey";
import { useParticipantAvatars } from "@/hooks/useParticipantAvatars";
import { useCrawlMediaItems } from "@/hooks/useCrawlMediaItems";
import { requestLocationPermission } from "@/redux/actions/mapActions";

type EditCrawlPresenterProps = {
    mode?: "new" | "active";
};

export function EditCrawlPresenter({ mode = "new" }: EditCrawlPresenterProps): ReactElement {
    const dispatch = useAppDispatch();
    const isFocused = useIsFocused();
    const { userLocation, defaultLocation } = useAppSelector((state) => state.map);
    const activeCrawlDetails = useAppSelector(selectActiveCrawlScreenModel);
    const newCrawlDraftStops = useAppSelector(selectNewCrawlDraftStops);
    const activeCrawlId = useAppSelector((state) => state.activeCrawl?.id ?? null);
    const isActiveMode = mode === "active";
    const [title, setTitle] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isEnding, setIsEnding] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [isEndModalVisible, setIsEndModalVisible] = useState(false);
    const [isLeaveModalVisible, setIsLeaveModalVisible] = useState(false);
    const {
        isRefreshing,
        isEntryLoading,
        refreshActiveCrawl: refreshActiveCrawlACB,
    } = useActiveCrawlRefresh({ isActiveMode });
    const activeParticipantIdsKey = useParticipantIdsKey(
        isActiveMode ? activeCrawlDetails.participantIds : []
    );
    const {
        avatarUrls: activeParticipantAvatarUrls,
        isLoading: isParticipantAvatarsLoading,
    } = useParticipantAvatars({
        participantIdsKey: activeParticipantIdsKey,
        isFocused,
        shouldUpdate: isActiveMode,
        fetchWhenNotUpdating: isActiveMode,
    });
    const { mediaItems: crawlMediaItems } = useCrawlMediaItems({
        crawlId: isActiveMode ? activeCrawlId ?? "" : "",
        isFocused,
        shouldUpdate: isActiveMode,
        fetchWhenNotUpdating: isActiveMode,
    });

    useEffect(() => {
        dispatch(requestLocationPermission());
    }, [dispatch]);

    useEffect(() => {
        if (!isActiveMode || !isFocused) {
            return;
        }

        void refreshActiveCrawlACB(false, true);
    }, [isActiveMode, isFocused, refreshActiveCrawlACB]);

    useEffect(() => {
        if (!isActiveMode) {
            return;
        }

        setTitle(activeCrawlDetails.title === "No Active Crawl" ? "" : activeCrawlDetails.title);
        setIsPublic(Boolean(activeCrawlDetails.isPublic));
    }, [activeCrawlDetails.title, isActiveMode]);

    const stops = isActiveMode ? activeCrawlDetails.stops : newCrawlDraftStops;
    const participantAvatarUrls = activeParticipantAvatarUrls;

    async function onSaveACB() {
        if (isSaving || isEnding || isLeaving) {
            return;
        }

        setIsSaving(true);

        if (isActiveMode) {
            const normalizedTitle = title.trim() || "Untitled Crawl";
            setTitle(normalizedTitle);
            try {
                await dispatch(updateLoggedUserActiveCrawl(normalizedTitle, isPublic));
            } finally {
                setIsSaving(false);
            }
            return;
        }

        try {
            const createdCrawlId = await dispatch(createLoggedUserPubCrawl(title, newCrawlDraftStops, isPublic));

            if (!createdCrawlId) {
                return;
            }

            dispatch(clearNewCrawlDraft());
            router.replace("/activeCrawl");
        } finally {
            setIsSaving(false);
        }
    }

    function onRequestEndCrawlACB() {
        if (isSaving || isEnding || isLeaving) return;
        setIsEndModalVisible(true);
    }

    function onCancelEndCrawlACB() {
        if (isEnding) return;
        setIsEndModalVisible(false);
    }

    async function onConfirmEndCrawlACB() {
        if (isSaving || isEnding || isLeaving) return;

        if (!isActiveMode) {
            router.navigate("/crawlHistory");
            return;
        }

        setIsEnding(true);

        try {
            const didEndCrawl = await dispatch(endLoggedUserActiveCrawl());

            if (!didEndCrawl) return;

            setIsEndModalVisible(false);
            router.replace("/crawlHistory");
        } finally {
            setIsEnding(false);
        }
    }

    function onRequestLeaveACB() {
        if (isSaving || isEnding || isLeaving) return;
        setIsLeaveModalVisible(true);
    }

    function onCancelLeaveACB() {
        if (isLeaving) return;
        setIsLeaveModalVisible(false);
    }

    async function onConfirmLeaveACB() {
        if (isSaving || isEnding || isLeaving) return;
        setIsLeaving(true);

        try {
            const didLeave = await dispatch(leaveLoggedUserActiveCrawl());
            if (!didLeave) return;
            setIsLeaveModalVisible(false);
            router.replace("/crawlHistory");
        } finally {
            setIsLeaving(false);
        }
    }

    function onShareACB() {
        const shareableCrawlId = isActiveMode ? activeCrawlId : null;

        if (!shareableCrawlId) {
            const message = isActiveMode
                ? "No active crawl to share yet. Please try again in a moment."
                : "Save this crawl first to generate a shareable QR code.";

            if (Platform.OS === "web") {
                window.alert(message);
            } else {
                Alert.alert("Share Crawl", message);
            }
            return;
        }

        const shareableCrawlName = isActiveMode && activeCrawlDetails.title !== "No Active Crawl"
            ? activeCrawlDetails.title
            : title;

        router.navigate({
            pathname: "/shareCrawl",
            params: {
                crawlId: shareableCrawlId,
                crawlName: shareableCrawlName,
            },
        });
    }

    return (
        <EditCrawlView
            mode={mode}
            title={title}
            onTitleChange={setTitle}
            stops={stops}
            participantAvatarUrls={participantAvatarUrls}
            onAddNew={() =>
                router.navigate({
                    pathname: "/activeCrawl/newStop",
                    params: {
                        mode: isActiveMode ? "active" : "draft",
                        update: "false",
                    },
                })
            }
            onEditStop={(stopId) =>
                router.navigate({
                    pathname: "/activeCrawl/stops/[stopUid]",
                    params: {
                        stopUid: stopId,
                        mode: isActiveMode ? "active" : "draft",
                        update: "false",
                    },
                })
            }
            onViewStop={
                isActiveMode && activeCrawlId
                    ? (stopId) =>
                          router.navigate({
                              pathname: "/viewCrawl/[crawlUid]/stops/[stopUid]",
                              params: {
                                  crawlUid: activeCrawlId,
                                  stopUid: stopId,
                                  update: "false",
                              },
                          })
                    : undefined
            }
            onAddMedia={
                isActiveMode
                    ? () =>
                          router.navigate({
                              pathname: "/activeCrawl/captureMedia",
                          })
                    : undefined
            }
            crawlMediaItems={crawlMediaItems}
            onOpenAlbum={
                isActiveMode && activeCrawlId
                    ? (index) =>
                          router.navigate({
                              pathname: "/album/[crawlUid]",
                              params: {
                                  crawlUid: activeCrawlId,
                                  index: String(index),
                              },
                          })
                    : undefined
            }
            onShare={onShareACB}
            onSave={onSaveACB}
            onEndCrawl={isActiveMode && activeCrawlDetails.isOwner ? onRequestEndCrawlACB : onConfirmEndCrawlACB}
            onConfirmEnd={isActiveMode && activeCrawlDetails.isOwner ? onConfirmEndCrawlACB : undefined}
            onCancelEnd={isActiveMode && activeCrawlDetails.isOwner ? onCancelEndCrawlACB : undefined}
            isEndModalVisible={isEndModalVisible}
            onLeaveCrawl={isActiveMode && !activeCrawlDetails.isOwner ? onRequestLeaveACB : undefined}
            onConfirmLeave={isActiveMode && !activeCrawlDetails.isOwner ? onConfirmLeaveACB : undefined}
            onCancelLeave={isActiveMode && !activeCrawlDetails.isOwner ? onCancelLeaveACB : undefined}
            isLeaveModalVisible={isLeaveModalVisible}
            isLeaving={isLeaving}
            isPublic={isPublic}
            onIsPublicChange={setIsPublic}
            isLoading={isActiveMode ? isEntryLoading || isParticipantAvatarsLoading : false}
            isSaving={isSaving}
            isEnding={isEnding}
            isOwner={isActiveMode ? activeCrawlDetails.isOwner : true}
            actionsDisabled={isSaving || isEnding || isLeaving || (isActiveMode && isEntryLoading)}
            refreshing={isActiveMode ? isRefreshing : false}
            onRefresh={isActiveMode ? () => void refreshActiveCrawlACB() : undefined}
        />
    );
}
