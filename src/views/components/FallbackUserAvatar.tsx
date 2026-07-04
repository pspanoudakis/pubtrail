import { StyleProp, View, ViewStyle, ImageStyle, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { COLORS } from "@/styles/theme";

type FallBackUserAvatarProps = {
    style: StyleProp<ImageStyle>;
};

export function FallBackUserAvatar({ style }: FallBackUserAvatarProps) {
    return (
        <View style={[style as StyleProp<ViewStyle>, styles.avatarFallback]}>
            <MaterialIcons name="person" size={22} color={COLORS.textSecondary} />
        </View>
    );
}

const styles = StyleSheet.create({
    avatarFallback: {
        backgroundColor: COLORS.mapBackground,
        alignItems: "center",
        justifyContent: "center",
    },
});
