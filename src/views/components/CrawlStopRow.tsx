import { ReactElement } from "react";
import { Pressable, Text, View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { COLORS } from "@/styles/theme";
import { commonStyles } from "@/styles/commonStyles";
import { formatDateTimeShort } from "@/utils/dateUtils";

type CrawlStopRowProps = {
    index: number;
    pubName: string;
    visitedOn: number;
    mode: "view" | "edit";
    onPress?: () => void;
    disabled?: boolean;
};

export function CrawlStopRow({
    index,
    pubName,
    visitedOn,
    mode,
    onPress,
    disabled = false,
}: CrawlStopRowProps): ReactElement {
    const isPressable = Boolean(onPress) && !disabled;
    return (
        <View>
            <View style={commonStyles.stopRow}>
                <View>
                    <Text style={commonStyles.stopLabel}>
                        {index + 1}. {pubName}
                    </Text>
                    {Boolean(visitedOn) && (
                        <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 4 }}>
                            {formatDateTimeShort(visitedOn)}
                        </Text>
                    )}
                </View>
                {isPressable ? (
                    <Pressable
                        disabled={disabled}
                        onPress={onPress}
                        style={commonStyles.iconPlainButton}
                    >
                        <FontAwesome5
                            name={mode === "edit" ? "pencil-alt" : "eye"}
                            size={20}
                            color={COLORS.icon}
                        />
                    </Pressable>
                ) : null}
            </View>
            <View style={commonStyles.separator} />
        </View>
    );
}
