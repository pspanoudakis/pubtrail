import { ReactElement } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { commonStyles } from "@/styles/commonStyles";
import { COLORS } from "@/styles/theme";

export type ScreenLoaderProps = {
    label?: string;
};

export function ScreenLoader({ label = "Loading..." }: ScreenLoaderProps): ReactElement {
    return (
        <View style={[commonStyles.screenContent, styles.screenLoader]}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={commonStyles.subtleText}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    screenLoader: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
});
