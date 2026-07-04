import { ReactElement } from "react";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { COLORS } from "@/styles/theme";
import { commonStyles } from "@/styles/commonStyles";
import { ScreenLoader } from "@/views/components/ScreenLoader";
import { ViewOnlyMapPanel } from "@/views/components/ViewOnlyMapPanel";
import type { GeoCoordinates } from "@/utils/geo";

type ViewCrawlStopViewProps = {
    isLoading?: boolean;
    stopName: string;
    notes: string;
    stopCoordinates?: GeoCoordinates;
    visitedOn?: number;
};

export function ViewCrawlStopView({
    isLoading = false,
    stopName,
    notes,
    stopCoordinates,
    visitedOn,
}: ViewCrawlStopViewProps): ReactElement {
    if (isLoading) {
        return <ScreenLoader label="Loading stop details..." />;
    }

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
            <View style={[commonStyles.screenContent, commonStyles.contentGap12]}>
                <View style={commonStyles.rowBetweenCenter}>
                    <Text style={styles.locationText}>{stopName}</Text>
                </View>
                {visitedOn && (
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        backgroundColor: COLORS.primary + "10",
                        borderRadius: 8,
                        alignSelf: "flex-start",
                    }}>
                        <FontAwesome5 name="clock" size={14} color={COLORS.primary} style={{ marginRight: 8 }} />
                        <Text style={{ fontSize: 14, color: COLORS.primary, fontWeight: "500" }}>
                            {new Date(visitedOn).toLocaleString(undefined, {
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric', 
                                hour: 'numeric', 
                                minute: '2-digit'
                            })}
                        </Text>
                    </View>
                )}
                {stopCoordinates ? (
                    <ViewOnlyMapPanel coordinates={stopCoordinates} />
                ) : null}
                <View style={commonStyles.notesBox}>
                    <Text style={commonStyles.notesLabel}>Notes</Text>
                    <Text style={commonStyles.bodyText}>{notes}</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    locationText: {
        fontSize: 18,
        color: COLORS.textPrimary,
        fontWeight: "600",
    },
});
