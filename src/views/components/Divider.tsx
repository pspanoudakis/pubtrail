import { ReactElement } from "react";
import { View, StyleSheet } from "react-native";
import { createThemedStyles } from "@/styles/createThemedStyles";

export function Divider(): ReactElement {
    const styles = useStyles();
    return <View style={styles.divider} />;
}

const useStyles = createThemedStyles(({ COLORS }) => StyleSheet.create({
    divider: {
        height: 1,
        backgroundColor: COLORS.divider,
    },
}));
