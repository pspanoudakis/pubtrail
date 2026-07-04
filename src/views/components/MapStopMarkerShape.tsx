import { StyleSheet, View } from "react-native";
import { COLORS } from "@/styles/theme";

export function MapStopMarkerShape() {
    return (
        <View style={styles.pinOuter}>
            <View style={styles.pinInner} />
        </View>
    )
}

const styles = StyleSheet.create({
    pinOuter: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.surface,
        borderWidth: 2,
        borderColor: COLORS.primary,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    pinInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.primary,
    },
});
