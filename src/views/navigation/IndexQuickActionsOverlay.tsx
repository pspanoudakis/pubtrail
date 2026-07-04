import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {ReactElement} from "react";
import {Pressable, StyleSheet, Text, View} from "react-native";
import {COLORS, RADIUS, SPACING, TYPOGRAPHY} from "@/styles/theme";
import {useSafeAreaInsets} from "react-native-safe-area-context";

type IndexQuickActionsOverlayProps = {
    hasActiveCrawl: boolean,
    weatherTemp: number | null,
    onMenuPress: () => void,
    onPrimaryPress: () => void,
    onNearbyPress: () => void,
    onJoinPress: () => void,
    onSharePress?: () => void,
    onPhotoPress?: () => void
};

export function IndexQuickActionsOverlay(props: IndexQuickActionsOverlayProps): ReactElement {
    const insets = useSafeAreaInsets();

    return (
        <View pointerEvents="box-none" style={styles.overlayRoot}>
            <View style={[styles.topBar, {marginTop: insets.top + SPACING._10}]}>
                <Pressable onPress={props.onMenuPress} style={styles.menuButton} hitSlop={8}>
                    <MaterialIcons name="menu" size={24} color={COLORS.textPrimary}/>
                </Pressable>
                <Text style={styles.title}>PubTrail</Text>
                <View style={styles.headerRightArea}>
                    {props.weatherTemp !== null ? (
                        <View style={styles.tempBadge}>
                            <MaterialIcons name="thermostat" size={14} color={COLORS.textSecondary}/>
                            <Text style={styles.tempText}>{props.weatherTemp} °C</Text>
                        </View>
                    ) : (
                        <View style={styles.menuButton}/>
                    )}
                </View>
            </View>
            {props.hasActiveCrawl ? (
                <View style={styles.quickActionsRow}>

                    <Pressable style={styles.quickAction} onPress={props.onPrimaryPress}>
                        <MaterialIcons
                            name="directions-walk"
                            size={18}
                            color={COLORS.primary}
                        />
                        <Text style={styles.quickActionText}>Active crawl</Text>
                    </Pressable>
                    <Pressable style={styles.quickAction} onPress={props.onPhotoPress}>
                        <MaterialIcons name="photo-camera" size={18} color={COLORS.primary}/>
                        <Text style={styles.quickActionText}>Take photo</Text>
                    </Pressable>
                    <Pressable style={styles.quickAction} onPress={props.onSharePress}>
                        <MaterialIcons name="share" size={18} color={COLORS.primary}/>
                        <Text style={styles.quickActionText}>Share crawl</Text>
                    </Pressable>
                </View>
            ): (
                <View style={styles.quickActionsRow}>
                    <Pressable style={styles.quickAction} onPress={props.onPrimaryPress}>
                        <MaterialIcons name="add-box" size={18} color={COLORS.primary}/>
                        <Text style={styles.quickActionText}>New crawl</Text>
                    </Pressable>
                    <Pressable style={styles.quickAction} onPress={props.onJoinPress}>
                        <MaterialIcons name="qr-code" size={18} color={COLORS.primary}/>
                        <Text style={styles.quickActionText}>Join crawl</Text>
                    </Pressable>
                    <Pressable style={styles.quickAction} onPress={props.onNearbyPress}>
                        <MaterialIcons name="place" size={18} color={COLORS.primary}/>
                        <Text style={styles.quickActionText}>Nearby</Text>
                    </Pressable>

                </View>
            )
            }
        </View>
    )
}



const styles = StyleSheet.create({
    overlayRoot: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 10,
    },
    topBar: {
        marginHorizontal: SPACING._12,
        minHeight: 56,
        borderRadius: RADIUS.lg,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: SPACING._12,
        backgroundColor: "rgba(255, 249, 239, 0.92)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: COLORS.border,
    },
    menuButton: {
        width: 34,
        height: 34,
        borderRadius: RADIUS.pill,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.surface,
    },
    title: {
        color: COLORS.textPrimary,
        fontSize: TYPOGRAPHY.sizes.subtitle,
        fontWeight: "700",
    },
    headerRightArea: {
        minWidth: 34,
        alignItems: "flex-end",
        justifyContent: "center",
    },
    tempBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.pill,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
    },
    tempText: {
        fontSize: TYPOGRAPHY.sizes.small,
        fontWeight: "600",
        color: COLORS.textSecondary,
    },
    quickActionsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING.sm,
        paddingHorizontal: SPACING._12,
        paddingTop: SPACING._12,
    },
    quickAction: {
        flex: 1,
        minHeight: 44,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: SPACING.xs,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING._10,
        backgroundColor: "rgba(255, 249, 239, 0.92)",
        borderRadius: RADIUS.pill,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: COLORS.border,
    },
    quickActionText: {
        color: COLORS.textPrimary,
        fontSize: TYPOGRAPHY.sizes.small,
        fontWeight: "600",
    },
});




