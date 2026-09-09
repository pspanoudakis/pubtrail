import { Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { createThemedStyles } from "@/styles/createThemedStyles";
import { useTheme } from "@/styles/ThemeProvider";

type MapRefocusButtonProps = {
    onPress: () => void;
    iconSize?: number;
    buttonSize?: number;
    bottom?: number;
    right?: number;
    style?: StyleProp<ViewStyle>;
};

export function MapRefocusButton({
    onPress,
    iconSize = 24,
    buttonSize = 46,
    bottom = 12,
    right = 12,
    style,
}: MapRefocusButtonProps) {
    const styles = useStyles();
    const { COLORS } = useTheme();
    return (
        <Pressable
            onPress={onPress}
            style={[
                styles.button,
                {
                    width: buttonSize,
                    height: buttonSize,
                    bottom,
                    right,
                },
                style,
            ]}
            hitSlop={8}
        >
            <MaterialIcons name="my-location" size={iconSize} color={COLORS.textPrimary} />
        </Pressable>
    );
}

const useStyles = createThemedStyles(({ COLORS, SPACING, RADIUS }) => StyleSheet.create({
    button: {
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 249, 239, 0.92)",
        borderRadius: RADIUS.pill,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: COLORS.border,
        padding: SPACING.xs,
        zIndex: 10,
    },
}));
