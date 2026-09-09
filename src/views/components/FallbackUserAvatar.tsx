import { StyleProp, View, ViewStyle, ImageStyle, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { createThemedStyles } from "@/styles/createThemedStyles";
import { useTheme } from "@/styles/ThemeProvider";

type FallBackUserAvatarProps = {
    style: StyleProp<ImageStyle>;
};

export function FallBackUserAvatar({ style }: FallBackUserAvatarProps) {
    const styles = useStyles();
    const { COLORS } = useTheme();
    return (
        <View style={[style as StyleProp<ViewStyle>, styles.avatarFallback]}>
            <MaterialIcons name="person" size={22} color={COLORS.textSecondary} />
        </View>
    );
}

const useStyles = createThemedStyles(({ COLORS }) => StyleSheet.create({
    avatarFallback: {
        backgroundColor: COLORS.mapBackground,
        alignItems: "center",
        justifyContent: "center",
    },
}));
