import { ReactElement } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useCommonStyles } from "@/styles/useCommonStyles";
import { createThemedStyles } from "@/styles/createThemedStyles";
import { useTheme } from "@/styles/ThemeProvider";

export type ScreenLoaderProps = {
    label?: string;
};

export function ScreenLoader({ label = "Loading..." }: ScreenLoaderProps): ReactElement {
    const styles = useStyles();
    const commonStyles = useCommonStyles();
    const { COLORS } = useTheme();
    return (
        <View style={[commonStyles.screenContent, styles.screenLoader]}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={commonStyles.subtleText}>{label}</Text>
        </View>
    );
}

const useStyles = createThemedStyles(() => StyleSheet.create({
    screenLoader: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
}));
