import { ReactElement, useState } from "react";
import { Alert } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { useIsFocused } from "@react-navigation/native";
import { useCrawlMediaItems } from "@/hooks/useCrawlMediaItems";
import { MediaAlbumView } from "@/views/mediaAlbumView";
import type { MediaPreviewItem } from "@/views/components/MediaPreviewStrip";

type MediaAlbumPresenterProps = {
    crawlId: string;
    initialIndex?: number;
};

export function MediaAlbumPresenter({
    crawlId,
    initialIndex = 0,
}: MediaAlbumPresenterProps): ReactElement {
    const isFocused = useIsFocused();
    const { mediaItems, isLoading } = useCrawlMediaItems({
        crawlId,
        isFocused,
        shouldUpdate: true,
        fetchWhenNotUpdating: true,
    });
    const [isExporting, setIsExporting] = useState(false);

    const previewItems: MediaPreviewItem[] = mediaItems.map((item) => ({
        url: item.url,
    }));

    return (
        <MediaAlbumView
            items={previewItems}
            isLoading={isLoading}
            initialIndex={initialIndex}
            isExporting={isExporting}
            onExport={onExportACB}
        />
    );

    async function onExportACB(index: number): Promise<void> {
        if (isExporting) {
            return;
        }
        const target = previewItems[index];
        if (!target) {
            return;
        }
        setIsExporting(true);
        try {
            const permission = await MediaLibrary.requestPermissionsAsync(true);
            if (!permission.granted) {
                Alert.alert(
                    "Permission required",
                    "Please grant photo library access to save photos."
                );
                return;
            }

            const cacheDir = FileSystem.cacheDirectory;
            if (!cacheDir) {
                throw new Error("Cache directory unavailable.");
            }
            const fileName = `pubtrail-${Date.now()}.jpg`;
            const destination = cacheDir + fileName;

            const result = await FileSystem.downloadAsync(target.url, destination);
            if (result.status !== 200) {
                throw new Error(`Download failed (status ${result.status}).`);
            }

            await MediaLibrary.saveToLibraryAsync(result.uri);
            Alert.alert("Saved", "Photo saved to your device.");
        } catch (caughtError) {
            const message =
                caughtError instanceof Error
                    ? caughtError.message
                    : "Failed to save photo.";
            Alert.alert("Save failed", message);
        } finally {
            setIsExporting(false);
        }
    }
}
