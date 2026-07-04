import { ReactElement } from "react";
import { useLocalSearchParams } from "expo-router";
import { MediaAlbumPresenter } from "@/presenters/mediaAlbumPresenter";

export default function AlbumScreen(): ReactElement {
    const { crawlUid, index } = useLocalSearchParams<{
        crawlUid?: string;
        index?: string;
    }>();
    const crawlId = crawlUid ?? "";
    const parsedIndex = index ? parseInt(index, 10) : 0;
    const initialIndex = Number.isFinite(parsedIndex) ? parsedIndex : 0;

    return <MediaAlbumPresenter crawlId={crawlId} initialIndex={initialIndex} />;
}
