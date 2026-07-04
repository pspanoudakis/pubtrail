import { ReactElement } from "react";
import { View, StyleSheet } from "react-native";
import { COLORS } from "@/styles/theme";

export function Divider(): ReactElement {
    return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
    divider: {
        height: 1,
        backgroundColor: COLORS.divider,
    },
});
