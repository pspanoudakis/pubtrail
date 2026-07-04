import { ReactElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { COLORS, SPACING, TYPOGRAPHY } from "@/styles/theme";
import { ScreenLoader } from "@/views/components/ScreenLoader";
import type { MediaPreviewItem } from "@/views/components/MediaPreviewStrip";

type MediaAlbumViewProps = {
    items: MediaPreviewItem[];
    isLoading: boolean;
    initialIndex: number;
    isExporting: boolean;
    onExport: (index: number) => void;
};

export function MediaAlbumView({
    items,
    isLoading,
    initialIndex,
    isExporting,
    onExport,
}: MediaAlbumViewProps): ReactElement {
    const { width: screenWidth } = useWindowDimensions();

    const safeInitialIndex = useMemo(() => {
        return (
            items.length > 0
            ? Math.min(Math.max(initialIndex, 0), items.length - 1)
            : 0
        )
    }, [initialIndex, items.length]);
    const [currentIndex, setCurrentIndex] = useState(safeInitialIndex);
    const listRef = useRef<FlatList<MediaPreviewItem>>(null);
    useEffect(() => {
        if (items.length === 0)  return;
        setCurrentIndex(safeInitialIndex);
    }, [safeInitialIndex, items.length]);

    const onMomentumScrollEndACB = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const offsetX = event.nativeEvent.contentOffset.x;
            const newIndex = Math.round(offsetX / screenWidth);
            if (newIndex !== currentIndex) {
                setCurrentIndex(newIndex);
            }
        },
        [currentIndex, screenWidth]
    );

    if (isLoading && items.length === 0) {
        return <ScreenLoader label="Loading photos..." />;
    }

    if (items.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <MaterialIcons
                    name="photo-library"
                    size={48}
                    color={COLORS.textSecondary}
                />
                <Text style={styles.emptyText}>
                    No photos for this crawl yet.
                </Text>
            </View>
        );
    }

    function getItemLayoutCB(_: ArrayLike<MediaPreviewItem> | null | undefined, index: number) {
        return { length: screenWidth, offset: screenWidth * index, index };
    }

    function keyExtractorCB(item: MediaPreviewItem, index: number): string {
        return `${item.url}-${index}`;
    }

    function renderItemCB({ item }: { item: MediaPreviewItem }): ReactElement {
        return (
            <View style={[styles.page, { width: screenWidth }]}>
                <Image
                    source={{ uri: item.url }}
                    style={styles.media}
                    resizeMode="contain"
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                ref={listRef}
                data={items}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                initialScrollIndex={safeInitialIndex}
                getItemLayout={getItemLayoutCB}
                keyExtractor={keyExtractorCB}
                renderItem={renderItemCB}
                onMomentumScrollEnd={onMomentumScrollEndACB}
            />
            <View style={styles.indicator} pointerEvents="none">
                <Text style={styles.indicatorText}>
                    {currentIndex + 1} / {items.length}
                </Text>
            </View>
            <Pressable
                onPress={onExportPressACB}
                disabled={isExporting}
                style={({ pressed }) => [
                    styles.exportButton,
                    isExporting && styles.exportButtonDisabled,
                    pressed && !isExporting && styles.exportButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Save photo to device"
            >
                {isExporting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                    <MaterialIcons name="file-download" size={24} color="#ffffff" />
                )}
            </Pressable>
        </View>
    );

    function onExportPressACB(): void {
        onExport(currentIndex);
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000000",
    },
    page: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    media: {
        width: "100%",
        height: "100%",
    },
    indicator: {
        position: "absolute",
        top: SPACING.md,
        alignSelf: "center",
        backgroundColor: "rgba(0,0,0,0.55)",
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: 16,
    },
    indicatorText: {
        color: "#ffffff",
        fontSize: TYPOGRAPHY.sizes.body,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    exportButton: {
        position: "absolute",
        top: SPACING.md,
        right: SPACING.md,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(0,0,0,0.55)",
        alignItems: "center",
        justifyContent: "center",
    },
    exportButtonPressed: {
        backgroundColor: "rgba(0,0,0,0.8)",
    },
    exportButtonDisabled: {
        opacity: 0.6,
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: SPACING.lg,
        gap: SPACING.md,
        backgroundColor: COLORS.background,
    },
    emptyText: {
        textAlign: "center",
        color: COLORS.textSecondary,
        fontSize: TYPOGRAPHY.sizes.body,
    },
});
