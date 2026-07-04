import { ReactElement } from "react";
import { View, Image, Pressable, Text, StyleSheet } from "react-native";
import { COLORS } from "@/styles/theme";

export type MediaPreviewItem = {
    url: string;
};

export type MediaPreviewStripProps = {
    /** Legacy: list of image URLs only. Prefer `items`. */
    imageUrls?: string[];
    items?: MediaPreviewItem[];
    onPressItem?: (index: number) => void;
};

export function MediaPreviewStrip({
    imageUrls,
    items,
    onPressItem,
}: MediaPreviewStripProps): ReactElement | null {
    const resolvedItems: MediaPreviewItem[] =
        items ?? (imageUrls ?? []).map((url) => ({ url }));

    if (!resolvedItems.length) {
        return null;
    }

    const visibleItems = resolvedItems.slice(0, 3);
    const extraCount = resolvedItems.length - visibleItems.length;

    return (
        <View style={styles.mediaRow}>
            {visibleItems.map((item, index) => {
                const thumbContent = (
                    <View style={styles.thumbWrapper}>
                        <Image source={{ uri: item.url }} style={styles.mediaThumb} />
                    </View>
                );

                if (onPressItem) {
                    return (
                        <Pressable
                            key={`${item.url}-${index}`}
                            onPress={() => onPressItem(index)}
                        >
                            {thumbContent}
                        </Pressable>
                    );
                }

                return <View key={`${item.url}-${index}`}>{thumbContent}</View>;
            })}
            {extraCount > 0 ? (
                onPressItem ? (
                    <Pressable
                        style={styles.moreBadge}
                        onPress={() => onPressItem(visibleItems.length)}
                    >
                        <Text style={styles.moreBadgeText}>+{extraCount}</Text>
                    </Pressable>
                ) : (
                    <View style={styles.moreBadge}>
                        <Text style={styles.moreBadgeText}>+{extraCount}</Text>
                    </View>
                )
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    mediaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 2,
    },
    thumbWrapper: {
        position: "relative",
    },
    mediaThumb: {
        width: 62,
        height: 62,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.mapBackground,
    },
    moreBadge: {
        minWidth: 50,
        height: 62,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surface,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 10,
    },
    moreBadgeText: {
        fontSize: 18,
        fontWeight: "700",
        color: COLORS.textSecondary,
    },
});
