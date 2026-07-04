import { ReactElement, useRef, useState } from "react";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Platform, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { COLORS } from "@/styles/theme";
import { commonStyles } from "@/styles/commonStyles";
import { ScreenLoader } from "@/views/components/ScreenLoader";
import { ActionButton } from "@/views/components/ActionButton";
import { ViewOnlyMapPanel } from "@/views/components/ViewOnlyMapPanel";
import type { NearbyPlace } from "@/mapboxConfig";
import { formatDateTimeLong } from "@/utils/dateUtils";
import type { GeoCoordinates } from "@/utils/geo";
import { RefreshIndicator } from "@/views/components/RefreshIndicator";

type EditStopViewProps = {
    isLoading?: boolean;
    isSaving?: boolean;
    stopName: string;
    onStopNameChange: (text: string) => void;
    stopNotes: string;
    onStopNotesChange: (text: string) => void;
    visitedOn: number;
    onVisitedOnChange: (timestamp: number) => void;
    onSave: () => void;
    isLocationGranted: boolean;
    userCoordinates: GeoCoordinates;
    stopCoordinates?: GeoCoordinates;
    refreshing?: boolean;
    onRefresh?: () => void;
    nearbyPlaces?: NearbyPlace[];
    isNearbyPlacesLoading?: boolean;
    hasNearbyPlacesLoaded?: boolean;
    nearbyPlacesError?: string | null;
    selectedNearbyPlaceId?: string | null;
    isCustomPlaceSelected?: boolean;
    onNearbyPlacePress?: (place: NearbyPlace) => void;
    onCustomPlacePress?: () => void;
};

export function EditStopView({
    isLoading = false,
    isSaving = false,
    stopName,
    onStopNameChange,
    stopNotes,
    onStopNotesChange,
    visitedOn,
    onVisitedOnChange,
    onSave,
    isLocationGranted,
    userCoordinates,
    stopCoordinates,
    refreshing = false,
    onRefresh,
    nearbyPlaces = [],
    isNearbyPlacesLoading = false,
    hasNearbyPlacesLoaded = false,
    nearbyPlacesError = null,
    selectedNearbyPlaceId = null,
    isCustomPlaceSelected = false,
    onNearbyPlacePress,
    onCustomPlacePress,
}: EditStopViewProps): ReactElement {

    const customNameInputRef = useRef<TextInput>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerMode, setDatePickerMode] = useState<"date" | "time" | "datetime">(Platform.OS === 'ios' ? 'datetime' : 'date');
    const webInputRef = useRef<HTMLInputElement>(null);
    const [isInteractingWithMap, setIsInteractingWithMap] = useState(false);

    const openDatePicker = () => {
        if (Platform.OS === 'web') {
            try {
                // @ts-ignore - showPicker is available in modern browsers
                webInputRef.current?.showPicker();
            } catch (e) {
                // Fallback for older browsers
                webInputRef.current?.focus();
            }
            return;
        }
        setDatePickerMode(Platform.OS === 'ios' ? 'datetime' : 'date');
        setShowDatePicker(true);
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === "android") {
            setShowDatePicker(false);
            if (event.type === "set" && selectedDate) {
                onVisitedOnChange(selectedDate.getTime());
                if (datePickerMode === "date") {
                    // Small timeout ensures the date picker dialog closes completely before opening the time picker
                    setTimeout(() => {
                        setDatePickerMode("time");
                        setShowDatePicker(true);
                    }, 50);
                }
            }
        } else {
            if (event.type === "set" || event.type === "dismissed") {
                setShowDatePicker(false);
            }
            if (selectedDate) {
                onVisitedOnChange(selectedDate.getTime());
            }
        }
    };

    if (isLoading) {
        return <ScreenLoader label="Loading stop..." />;
    }

    const showNearbyPlacesSection =
        isNearbyPlacesLoading || Boolean(nearbyPlacesError) || nearbyPlaces.length > 0 || hasNearbyPlacesLoaded;

    return (
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={!isInteractingWithMap}
            onTouchEnd={() => setIsInteractingWithMap(false)}
            onTouchCancel={() => setIsInteractingWithMap(false)}
            refreshControl={
                onRefresh && <RefreshIndicator refreshing={refreshing} onRefresh={onRefresh}/>
            }
        >
            <View style={[commonStyles.screenContent, commonStyles.contentGap12]}>
                {showNearbyPlacesSection ? (
                    <View style={[styles.nearbyPlacesSection]}>
                        <Text style={commonStyles.cardTitle}>Where are we crawling?</Text>
                        {isNearbyPlacesLoading ? (
                            <View style={styles.nearbyPlacesStateRow}>
                                <ActivityIndicator size="small" color={COLORS.primary} />
                                <Text style={commonStyles.subtleText}>Finding places near you...</Text>
                            </View>
                        ) : nearbyPlacesError ? (
                            <Text style={[commonStyles.subtleText, styles.nearbyPlacesError]}>
                                {nearbyPlacesError}
                            </Text>
                        ) : nearbyPlaces.length > 0 ? (
                            <View style={styles.nearbyPlacesList}>
                                {nearbyPlaces.map((place) => (
                                    <Pressable
                                        key={place.id}
                                        onPress={() => onNearbyPlacePress?.(place)}
                                        disabled={!onNearbyPlacePress || isSaving}
                                        style={({ pressed }) => [
                                            styles.nearbyPlaceItem,
                                            selectedNearbyPlaceId === place.id ? styles.nearbyPlaceItemSelected : null,
                                            pressed ? styles.nearbyPlaceItemPressed : null,
                                        ]}
                                    >
                                        <FontAwesome5
                                            name="map-marker-alt"
                                            size={16}
                                            color={COLORS.primary}
                                        />
                                        <View style={styles.nearbyPlaceTextWrap}>
                                            <View style={styles.nearbyPlaceHeaderRow}>
                                                <Text style={styles.nearbyPlaceName} numberOfLines={1}>
                                                    {place.name}
                                                </Text>
                                                {typeof place.distance === "number" ? (
                                                    <Text style={[commonStyles.cardMeta, styles.nearbyPlaceDistance]}>
                                                        {formatDistance(place.distance)}
                                                    </Text>
                                                ) : null}
                                            </View>
                                        </View>
                                    </Pressable>
                                ))}
                                <Pressable
                                    onPress={() => {
                                        onCustomPlacePress?.();
                                        customNameInputRef.current?.focus();
                                    }}
                                    style={({ pressed }) => [
                                        styles.nearbyPlaceItem,
                                        styles.customPlaceItem,
                                        isCustomPlaceSelected ? styles.nearbyPlaceItemSelected : null,
                                        pressed ? styles.nearbyPlaceItemPressed : null,
                                    ]}
                                >
                                    <FontAwesome5 name="pen" size={16} color={COLORS.textSecondary} />
                                    <View style={styles.nearbyPlaceTextWrap}>
                                        <Text style={styles.customPlaceLabel}>Found a hidden gem?</Text>
                                        <TextInput
                                            ref={customNameInputRef}
                                            value={stopName}
                                            onChangeText={onStopNameChange}
                                            placeholder="Name the magic spot here..."
                                            placeholderTextColor={COLORS.textSecondary}
                                            editable={!isSaving}
                                            style={styles.customPlaceInput}
                                        />
                                    </View>
                                </Pressable>
                            </View>
                        ) : hasNearbyPlacesLoaded ? (
                            <Text style={commonStyles.subtleText}>
                                No nearby food and drink places found.
                            </Text>
                        ) : null}
                    </View>
                ) : null}

                <ViewOnlyMapPanel
                    coordinates={stopCoordinates}
                    userCoordinates={userCoordinates}
                    isLocationGranted={isLocationGranted}
                    title="Stop Location"
                    height={260}
                    subtitle=""
                    onMapInteractionChange={setIsInteractingWithMap}
                />

                <View>
                    <View style={{ position: 'relative' }}>
                        <TouchableOpacity 
                            onPress={openDatePicker}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                padding: 16,
                                backgroundColor: COLORS.surface,
                                borderRadius: 12,
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.05,
                                shadowRadius: 4,
                                elevation: 2,
                            }}
                            activeOpacity={Platform.OS === 'web' ? 0.7 : 0.2}
                        >
                            <View style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: COLORS.primary + "15",
                                justifyContent: "center",
                                alignItems: "center",
                                marginRight: 12,
                            }}>
                                <FontAwesome5 name="calendar-alt" size={20} color={COLORS.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: COLORS.textSecondary, fontSize: 12, marginBottom: 4, fontWeight: "600" }}>VISITED ON</Text>
                                <Text style={{ color: COLORS.textPrimary, fontSize: 16, fontWeight: "500" }}>
                                    {formatDateTimeLong(visitedOn)}
                                </Text>
                            </View>
                            <MaterialIcons name="edit" size={20} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                        
                        {Platform.OS === 'web' && (
                            <input
                                ref={webInputRef as any}
                                type="datetime-local"
                                value={new Date(visitedOn - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                                onChange={(e) => onVisitedOnChange(new Date(e.target.value).getTime())}
                                style={{
                                    position: 'absolute',
                                    visibility: 'hidden',
                                    width: 0,
                                    height: 0,
                                    pointerEvents: 'none',
                                }}
                            />
                        )}
                        
                        {Platform.OS !== 'web' && showDatePicker && (
                            <DateTimePicker
                                value={new Date(visitedOn)}
                                mode={datePickerMode}
                                display="default"
                                onChange={handleDateChange}
                            />
                        )}
                    </View>
                </View>
                <TextInput
                    style={commonStyles.notesInput}
                    multiline
                    placeholder="Notes ..."
                    placeholderTextColor={COLORS.textSecondary}
                    value={stopNotes}
                    onChangeText={onStopNotesChange}
                    editable={!isSaving}
                />
                <ActionButton
                    label="Save"
                    onPress={onSave}
                    loading={isSaving}
                    loadingLabel="Saving..."
                    disabled={isSaving}
                    icon={<FontAwesome5 name="save" size={20} color={COLORS.surface} />}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    nearbyPlacesSection: {
        gap: 12,
    },
    nearbyPlacesStateRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    nearbyPlacesError: {
        color: COLORS.error,
    },
    nearbyPlacesList: {
        gap: 10,
    },
    nearbyPlaceItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        padding: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surface,
    },
    nearbyPlaceItemPressed: {
        opacity: 0.8,
    },
    nearbyPlaceItemSelected: {
        borderColor: COLORS.primary,
        backgroundColor: "rgba(139, 94, 60, 0.08)",
    },
    customPlaceItem: {
        borderStyle: "dashed",
    },
    nearbyPlaceTextWrap: {
        flex: 1,
        gap: 2,
    },
    nearbyPlaceHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    nearbyPlaceName: {
        flexShrink: 1,
        fontSize: 16,
        color: COLORS.textPrimary,
        fontWeight: "600",
    },
    nearbyPlaceDistance: {
        marginLeft: "auto",
        textAlign: "right",
    },
    customPlaceLabel: {
        fontSize: 16,
        color: COLORS.textPrimary,
        fontWeight: "600",
    },
    customPlaceInput: {
        fontSize: 15,
        color: COLORS.textPrimary,
        paddingVertical: 0,
        paddingHorizontal: 0,
    },
});

function formatDistance(distanceInMeters: number): string {
    if (distanceInMeters < 1000) {
        return `${Math.round(distanceInMeters)} m`;
    }

    return `${(distanceInMeters / 1000).toFixed(distanceInMeters < 10000 ? 1 : 0)} km`;
}

