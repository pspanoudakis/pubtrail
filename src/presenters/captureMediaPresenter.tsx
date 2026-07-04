import { ReactElement, useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { useAppDispatch, useAppSelector } from "@/redux/store/hooks";
import { selectActiveCrawl } from "@/redux/selectors/activeCrawlSelectors";
import {
    uploadMediaToCrawl,
    type UploadMediaResult,
} from "@/redux/actions/activeCrawlActions";
import { CaptureMediaView } from "@/views/captureMediaView";
import type { WatermarkedPhotoHandle } from "@/views/components/WatermarkedPhoto";
import { buildRetroTimestamp } from "@/utils/retroTimestamp";

type PendingCapture = {
    uri: string;
    timestamp: string;
};

export function CaptureMediaPresenter(): ReactElement {
    const dispatch = useAppDispatch();
    const activeCrawl = useAppSelector(selectActiveCrawl);
    const { crawlId: crawlIdParam } = useLocalSearchParams<{ crawlId?: string }>();
    const targetCrawlId = (crawlIdParam ?? "").trim() || activeCrawl?.id || null;

    const [cameraPermission, requestCameraPermission] = useCameraPermissions();

    const cameraRef = useRef<CameraView | null>(null);
    const watermarkRef = useRef<WatermarkedPhotoHandle | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pendingCapture, setPendingCapture] = useState<PendingCapture | null>(null);

    useEffect(function autoRequestCameraPermissionACB() {
        if (
            cameraPermission &&
            !cameraPermission.granted &&
            cameraPermission.canAskAgain &&
            !cameraPermission.status
        ) {
            void requestCameraPermission();
        }
    }, [cameraPermission, requestCameraPermission]);

    return (
        <CaptureMediaView
            cameraRef={cameraRef}
            watermarkRef={watermarkRef}
            cameraPermissionGranted={Boolean(cameraPermission?.granted)}
            cameraPermissionRequested={Boolean(cameraPermission)}
            onRequestCameraPermission={onRequestCameraPermissionACB}
            isUploading={isUploading}
            error={error}
            pendingCapture={pendingCapture}
            onCapturePhoto={onCapturePhotoACB}
            onConfirmUpload={onConfirmUploadACB}
            onRetake={onRetakeACB}
            onCancel={onCancelACB}
        />
    );

    function onRequestCameraPermissionACB() {
        void requestCameraPermission();
    }

    function onCancelACB() {
        router.back();
    }

    function onRetakeACB() {
        setPendingCapture(null);
        setError(null);
    }

    async function onCapturePhotoACB() {
        if (!cameraRef.current || isUploading || pendingCapture) {
            return;
        }
        setError(null);

        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.85,
                skipProcessing: false,
                exif: false,
            });
            if (!photo?.uri) {
                setError("Failed to capture photo.");
                return;
            }
            // Re-encode the photo so the EXIF orientation is baked into the
            // pixel data. Without this, captures from expo-camera can appear
            // rotated when displayed in components or services that ignore
            // EXIF orientation tags.
            const normalized = await manipulateAsync(photo.uri, [], {
                compress: 0.85,
                format: SaveFormat.JPEG,
            });
            setPendingCapture({
                uri: normalized.uri || photo.uri,
                timestamp: buildRetroTimestamp(new Date()),
            });
        } catch (caughtError) {
            const message =
                caughtError instanceof Error
                    ? caughtError.message
                    : "Failed to capture photo.";
            setError(message);
        }
    }

    async function onConfirmUploadACB() {
        if (!pendingCapture || isUploading) {
            return;
        }
        let uriToUpload = pendingCapture.uri;
        try {
            const composedUri = await watermarkRef.current?.captureToFile();
            if (composedUri) {
                uriToUpload = composedUri;
            }
        } catch (caughtError) {
            const message =
                caughtError instanceof Error
                    ? caughtError.message
                    : "Failed to compose watermark.";
            setError(message);
            return;
        }
        await uploadAndPersist(uriToUpload);
    }

    async function uploadAndPersist(fileUri: string): Promise<void> {
        if (!targetCrawlId) {
            setError("No crawl to attach media to. Join or start a crawl first.");
            return;
        }

        setIsUploading(true);
        try {
            const result: UploadMediaResult = await dispatch(
                uploadMediaToCrawl(targetCrawlId, fileUri)
            );

            switch (result.status) {
                case "uploaded":
                    setPendingCapture(null);
                    router.back();
                    return;
                case "no-active-crawl":
                case "no-crawl":
                    setError("No crawl to attach media to.");
                    return;
                case "not-authenticated":
                    setError("You must be signed in to upload media.");
                    return;
                case "error":
                    setError(result.message || "Failed to upload media.");
                    return;
            }
        } finally {
            setIsUploading(false);
        }
    }
}
