import { ReactElement, useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useCameraPermissions } from "expo-camera";
import { useAppDispatch } from "@/redux/store/hooks";
import { joinCrawlById, type JoinCrawlResult } from "@/redux/actions/activeCrawlActions";
import { JoinCrawlView } from "@/views/joinCrawlView";

export function JoinCrawlPresenter(): ReactElement {
    const dispatch = useAppDispatch();
    const params = useLocalSearchParams<{ crawlId?: string }>();
    const canUseCamera = Platform.OS !== "web";
    const [permission, requestPermission] = useCameraPermissions();
    const [isJoining, setIsJoining] = useState(false);
    const [scanPaused, setScanPaused] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [manualId, setManualId] = useState("");

    useEffect(function autoRequestPermissionOnMountACB() {
        if (!canUseCamera) {
            return;
        }
        if (permission && !permission.granted && permission.canAskAgain && !permission.status) {
            void requestPermission();
        }
    }, [canUseCamera, permission, requestPermission]);

    // Handle deep link parameter
    useEffect(function handleDeepLinkACB() {
        if (params.crawlId && typeof params.crawlId === "string") {
            void performJoin(params.crawlId);
        }
    }, [params.crawlId]);

    const performJoin = useCallback(
        async function performJoinACB(rawId: string) {
            const crawlId = rawId.trim();
            if (!crawlId || isJoining) {
                return;
            }

            setIsJoining(true);
            setScanPaused(true);
            setError(null);

            try {
                const result: JoinCrawlResult = await dispatch(joinCrawlById(crawlId));

                switch (result.status) {
                    case "joined":
                    case "already-participant":
                        router.replace("/activeCrawl");
                        return;
                    case "not-found":
                        setError("No crawl found with that code. Double-check the QR code or ID.");
                        return;
                    case "not-active":
                        setError("This crawl has already ended.");
                        return;
                    case "not-authenticated":
                        setError("You must be signed in to join a crawl.");
                        return;
                    case "error":
                        setError(result.message || "Could not join crawl. Please try again.");
                        return;
                }
            } finally {
                setIsJoining(false);
                // Re-enable scanning after a short pause so a steady camera doesn't re-fire.
                setTimeout(() => setScanPaused(false), 1500);
            }
        },
        [dispatch, isJoining]
    );

    return (
        <JoinCrawlView
            permissionGranted={Boolean(permission?.granted)}
            permissionRequested={Boolean(permission)}
            isJoining={isJoining}
            scanPaused={scanPaused}
            error={error}
            manualId={manualId}
            onManualIdChange={setManualId}
            onRequestPermission={onRequestPermissionACB}
            onBarcodeScanned={onBarcodeScannedACB}
            onSubmitManualId={onSubmitManualIdACB}
        />
    );

    function onRequestPermissionACB() {
        void requestPermission();
    }

    function onBarcodeScannedACB(data: string) {
        if (data.split('/').length > 1) {
            void performJoin(data.split('/').slice(-1)[0]);
            return;
        }
        void performJoin(data);
    }

    function onSubmitManualIdACB() {
        if (manualId.split('/').length > 1) {
            void performJoin(manualId.split('/').slice(-1)[0]);
            return;
        }
        void performJoin(manualId);
    }
}
