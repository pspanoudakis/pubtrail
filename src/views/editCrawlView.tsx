import { ReactElement } from "react";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, ScrollView, Text, View } from "react-native";
import { COLORS } from "@/styles/theme";
import { commonStyles } from "@/styles/commonStyles";
import { TitleInput } from "@/views/components/TitleInput";
import { ParticipantsAvatarStrip } from "@/views/components/ParticipantsAvatarStrip";
import { ScreenLoader } from "@/views/components/ScreenLoader";
import { ActionButton } from "@/views/components/ActionButton";
import { MediaPreviewStrip, type MediaPreviewItem } from "@/views/components/MediaPreviewStrip";
import { CrawlStopRow } from "@/views/components/CrawlStopRow";
import { CrawlVisibilitySection } from "@/views/components/CrawlVisibilitySection";
import { RefreshIndicator } from "@/views/components/RefreshIndicator";
import { ConfirmModal } from "@/views/components/ConfirmModal";

type EditCrawlViewProps = {
    mode?: "new" | "active";
    isLoading?: boolean;
    isSaving?: boolean;
    isEnding?: boolean;
    actionsDisabled?: boolean;
    isOwner?: boolean;
    title: string;
    onTitleChange: (text: string) => void;
    isPublic?: boolean;
    onIsPublicChange?: (next: boolean) => void;
    stops: Array<{ id: string; pubName: string; visitedOn: number }>;
    participantAvatarUrls: string[];
    crawlMediaItems?: MediaPreviewItem[];
    onAddNew: () => void;
    onEditStop: (stopId: string) => void;
    onViewStop?: (stopId: string) => void;
    onAddMedia?: () => void;
    onOpenAlbum?: (index: number) => void;
    onShare: () => void;
    onSave: () => void;
    onEndCrawl: () => void;
    onConfirmEnd?: () => void;
    onCancelEnd?: () => void;
    isEndModalVisible?: boolean;
    onLeaveCrawl?: () => void;
    onConfirmLeave?: () => void;
    onCancelLeave?: () => void;
    isLeaveModalVisible?: boolean;
    isLeaving?: boolean;
    refreshing: boolean;
    onRefresh?: () => void;
};

export function EditCrawlView({
    mode = "new",
    isLoading = false,
    isSaving = false,
    isEnding = false,
    actionsDisabled = false,
    isOwner = true,
    title,
    onTitleChange,
    isPublic = false,
    onIsPublicChange,
    stops,
    participantAvatarUrls,
    crawlMediaItems,
    onAddNew,
    onEditStop,
    onViewStop,
    onAddMedia,
    onOpenAlbum,
    onShare,
    onSave,
    onEndCrawl,
    onConfirmEnd,
    onCancelEnd,
    isEndModalVisible = false,
    onLeaveCrawl,
    onConfirmLeave,
    onCancelLeave,
    isLeaveModalVisible = false,
    isLeaving = false,
    refreshing = false,
    onRefresh,
}: EditCrawlViewProps): ReactElement {
    const isActiveMode = mode === "active";
    const saveLabel = isActiveMode ? "Save Changes" : "Save";
    const saveLoadingLabel = isActiveMode ? "Saving Changes..." : "Saving...";
    const isInteractionDisabled = actionsDisabled || isLoading;
    const hasMedia = (crawlMediaItems?.length ?? 0) > 0;

    if (isLoading) {
        return <ScreenLoader label="Loading crawl..." />;
    }

    return (
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshControl={
                onRefresh && <RefreshIndicator refreshing={refreshing} onRefresh={onRefresh}/>
            }
        >
            <View style={[commonStyles.screenContent, commonStyles.contentGap12]}>
                <TitleInput
                    value={title}
                    onChangeText={onTitleChange}
                    placeholder="Crawl Title"
                    editable={isOwner}
                />
                <Text style={commonStyles.sectionTitle}>Stops</Text>
                {stops.map((stop, index) => (
                    <CrawlStopRow
                        key={stop.id}
                        index={index}
                        pubName={stop.pubName}
                        visitedOn={stop.visitedOn}
                        mode={isOwner ? "edit" : "view"}
                        onPress={isOwner ? () => onEditStop(stop.id) : (onViewStop ? () => onViewStop(stop.id) : undefined)}
                        disabled={isInteractionDisabled}
                    />
                ))}
                {isOwner ? (
                    <Pressable disabled={isInteractionDisabled} onPress={onAddNew}>
                        <View style={commonStyles.stopRow}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                <FontAwesome5 name="plus" size={20} color={COLORS.icon} />
                                <Text style={commonStyles.stopLabel}>Add New</Text>
                            </View>
                        </View>
                        <View style={commonStyles.separator} />
                    </Pressable>
                ) : null}
                {isActiveMode ? (
                    <>
                        <Text style={commonStyles.sectionTitle}>Photos</Text>
                        {hasMedia ? (
                            <MediaPreviewStrip
                                items={crawlMediaItems}
                                onPressItem={onOpenAlbum}
                            />
                        ) : (
                            <Text style={commonStyles.subtleText}>
                                No photos yet. Capture one to share with your group.
                            </Text>
                        )}
                        {onAddMedia ?
                            <ActionButton
                                label="Add Photo"
                                onPress={onAddMedia}
                                disabled={isInteractionDisabled}
                                icon={<MaterialIcons name="photo-camera" size={22} color={COLORS.surface} />}
                            />
                        : null}
                    </>
                ): null}
                <CrawlVisibilitySection
                    isPublic={isPublic}
                    onIsPublicChange={onIsPublicChange}
                    isEditable={isOwner}
                />
                {isActiveMode ? (
                    <ActionButton
                        label="Share"
                        onPress={onShare}
                        disabled={isInteractionDisabled}
                        icon={<MaterialIcons name="qr-code-scanner" size={24} color={COLORS.surface} />}
                    />
                ): null}
                {isActiveMode && <>
                    <Text style={commonStyles.sectionTitle}>Participants</Text>
                    <ParticipantsAvatarStrip avatarUrls={participantAvatarUrls} />
                </>}
                <ActionButton
                    label={saveLabel}
                    onPress={onSave}
                    loading={isSaving}
                    loadingLabel={saveLoadingLabel}
                    disabled={isInteractionDisabled}
                    icon={<FontAwesome5 name="save" size={20} color={COLORS.surface} />}
                />
                {isActiveMode && !isOwner && onLeaveCrawl ? (
                    <ActionButton
                        label="Leave Crawl"
                        onPress={onLeaveCrawl}
                        loading={isLeaving}
                        loadingLabel="Leaving Crawl..."
                        disabled={isInteractionDisabled}
                        icon={<MaterialIcons name="logout" size={22} color={COLORS.surface} />}
                    />
                ) : null}
                {isActiveMode && isOwner ? (
                    <ActionButton
                        label="End Crawl"
                        onPress={onEndCrawl}
                        loading={isEnding}
                        loadingLabel="Ending Crawl..."
                        disabled={isInteractionDisabled}
                        icon={<FontAwesome5 name="flag" size={20} color={COLORS.surface} />}
                    />
                ) : null}
            </View>
            {onConfirmEnd && onCancelEnd ? (
                <ConfirmModal
                    visible={isEndModalVisible}
                    title="End crawl?"
                    message="This will end the crawl for everyone and move it to history."
                    confirmLabel="End Crawl"
                    cancelLabel="Keep Going"
                    destructive
                    isConfirmLoading={isEnding}
                    confirmDisabled={isInteractionDisabled}
                    onConfirm={onConfirmEnd}
                    onCancel={onCancelEnd}
                />
            ) : null}
            {onConfirmLeave && onCancelLeave ? (
                <ConfirmModal
                    visible={isLeaveModalVisible}
                    title="Leave crawl?"
                    message="It will still appear in your history after it ends."
                    confirmLabel="Leave Crawl"
                    cancelLabel="Stay"
                    destructive
                    isConfirmLoading={isLeaving}
                    confirmDisabled={isInteractionDisabled}
                    onConfirm={onConfirmLeave}
                    onCancel={onCancelLeave}
                />
            ) : null}
        </ScrollView>
    );
}
