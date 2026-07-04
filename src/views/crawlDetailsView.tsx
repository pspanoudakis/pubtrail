import { ReactElement, useMemo } from "react";
import {
    StyleSheet,
    Text,
    View,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {DEFAULT_LOCATION, GeoCoordinates} from "@/utils/geo";
import { commonStyles } from "@/styles/commonStyles";
import { COLORS, SPACING, TYPOGRAPHY } from "@/styles/theme";
import { ParticipantsAvatarStrip } from "@/views/components/ParticipantsAvatarStrip";
import { ScreenLoader } from "@/views/components/ScreenLoader";
import { ActionButton } from "@/views/components/ActionButton";
import { MediaPreviewStrip, type MediaPreviewItem } from "@/views/components/MediaPreviewStrip";
import { CrawlStopRow } from "@/views/components/CrawlStopRow";
import { FullScreenMap } from "@/views/components/FullScreenMap";
import { GestureBottomSheet } from "@/views/components/GestureBottomSheet";
import { pluralize } from "./shared/shared";

type CrawlDetailsViewProps = {
    isLoading?: boolean;
    title: string;
    participants: number;
    stops: Array<{ id: string; pubName: string; visitedOn: number; coordinates?: GeoCoordinates }>;
    participantAvatarUrls: string[];
    crawlMediaItems?: MediaPreviewItem[];
    isLocationGranted?: boolean;
    userLocation?: GeoCoordinates;
    onViewStop: (stopId: string) => void;
    onOpenAlbum?: (index: number) => void;
    onAddMedia?: () => void;
};

type RoutePoint = GeoCoordinates;

const COLLAPSED_PANEL_HEIGHT = 178;

export function CrawlDetailsView({
    isLoading = false,
    title,
    participants,
    stops,
    participantAvatarUrls,
    crawlMediaItems,
    isLocationGranted,
    userLocation,
    onViewStop,
    onOpenAlbum,
    onAddMedia,
}: CrawlDetailsViewProps): ReactElement {
    if (isLoading) {
        return <ScreenLoader label="Loading crawl details..." />;
    }

    const routeStops = useMemo(
        () => stops.filter((stop) => Boolean(stop.coordinates)) as Array<{
            id: string;
            pubName: string;
            visitedOn: number;
            coordinates: GeoCoordinates;
        }>,
        [stops]
    );
    const routePoints = useMemo<RoutePoint[]>(
        () => routeStops.map((stop) => stop.coordinates),
        [routeStops]
    );
    
    const hasMedia = (crawlMediaItems?.length ?? 0) > 0;

    function handleMarkerPress(_: GeoCoordinates, index: number) {
        const stop = routeStops[index];

        if (stop) {
            onViewStop(stop.id);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.mapStage}>
                {routePoints.length > 0 ? (
                    <FullScreenMap
                        isLocationGranted={Boolean(isLocationGranted)}
                        userLocation={userLocation ?? DEFAULT_LOCATION}
                        overlayPoints={routePoints}
                        onMarkerPressed={handleMarkerPress}
                        bottomPadding={COLLAPSED_PANEL_HEIGHT + 15}
                        showSheen={true}
                    />
                ) : (
                    <View style={styles.emptyMapStage}>
                        <Text style={styles.emptyMapTitle}>No stop coordinates yet</Text>
                        <Text style={styles.emptyMapSubtitle}>
                            Add coordinates to the stops to draw the crawl route.
                        </Text>
                    </View>
                )}
            </View>

            <GestureBottomSheet
                collapsedHeight={COLLAPSED_PANEL_HEIGHT}
                handleAreaStyle={{ paddingBottom: SPACING._12 }}
                header={(expanded) => (
                    <View style={styles.sheetSummaryRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.sheetTitle}>{title}</Text>
                            <Text style={styles.sheetMeta}>
                                {participants} {pluralize(participants, "participant", "participants")}
                                {routePoints.length > 0 ? ` · ${routePoints.length} mapped stops` : ""}
                            </Text>
                        </View>
                        <Text style={styles.sheetHint}>{expanded ? "Drag down" : "Drag up"}</Text>
                    </View>
                )}
                contentContainerStyle={styles.sheetContent}
            >
                <View style={commonStyles.contentGap12}>
                    <Text style={commonStyles.sectionTitle}>Stops</Text>
                    {stops.length === 0 ? (
                        <Text style={commonStyles.subtleText}>No stops have been added yet.</Text>
                    ) : null}
                    {stops.map((stop, index) => (
                        <CrawlStopRow
                            key={stop.id}
                            index={index}
                            pubName={stop.pubName}
                            visitedOn={stop.visitedOn}
                            mode="view"
                            onPress={() => onViewStop(stop.id)}
                        />
                    ))}

                    <Text style={commonStyles.sectionTitle}>Photos</Text>
                    {hasMedia ? (
                        <MediaPreviewStrip items={crawlMediaItems} onPressItem={onOpenAlbum} />
                    ) : (
                        <Text style={commonStyles.subtleText}>No photos for this crawl.</Text>
                    )}
                    {onAddMedia ? (
                        <ActionButton
                            label="Add Photo"
                            onPress={onAddMedia}
                            icon={<MaterialIcons name="photo-camera" size={22} color={COLORS.surface} />}
                        />
                    ) : null}

                    <Text style={commonStyles.sectionTitle}>Participants</Text>
                    <ParticipantsAvatarStrip avatarUrls={participantAvatarUrls} />
                </View>
            </GestureBottomSheet>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    mapStage: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.mapBackground,
    },
    mapCanvas: {
        flex: 1,
    },
    emptyMapStage: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: SPACING.lg,
        backgroundColor: COLORS.mapBackground,
        gap: SPACING._6,
    },
    emptyMapTitle: {
        fontSize: TYPOGRAPHY.sizes.subtitle,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.textPrimary,
        textAlign: "center",
    },
    emptyMapSubtitle: {
        fontSize: TYPOGRAPHY.sizes.body,
        color: COLORS.textSecondary,
        textAlign: "center",
        lineHeight: 22,
    },
    sheetSummaryRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: SPACING._12,
    },
    sheetTitle: {
        fontSize: TYPOGRAPHY.sizes.heading,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.textPrimary,
    },
    sheetMeta: {
        marginTop: 2,
        fontSize: TYPOGRAPHY.sizes.meta,
        color: COLORS.textSecondary,
    },
    sheetHint: {
        fontSize: TYPOGRAPHY.sizes.small,
        color: COLORS.primary,
        fontWeight: TYPOGRAPHY.weights.semibold,
        marginTop: 4,
    },
    sheetContent: {
        paddingHorizontal: SPACING._20,
        paddingTop: SPACING._14,
        paddingBottom: SPACING.xl,
    },
});
