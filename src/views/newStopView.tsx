import { ReactElement } from "react";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { TextInput, View } from "react-native";
import { useCommonStyles } from "@/styles/useCommonStyles";
import { MediaPreviewStrip } from "@/views/components/MediaPreviewStrip";
import { ActionButton } from "@/views/components/ActionButton";
import { useTheme } from "@/styles/ThemeProvider";

type EditStopViewProps = {
    stopName: string;
    mediaImageUrls: string[];
    onSave: () => void;
};

export function EditStopView({ stopName, mediaImageUrls, onSave }: EditStopViewProps): ReactElement {
    const commonStyles = useCommonStyles();
    const { COLORS } = useTheme();
    return (
        <>
            <View style={[commonStyles.screenContent, commonStyles.contentGap12]}>
                <View style={commonStyles.formTitleRow}>
                    <FontAwesome5 name="pencil-alt" size={20} color={COLORS.icon} />
                    <TextInput
                        style={commonStyles.formTitleInput}
                        defaultValue={stopName}
                        placeholder="Stop name"
                        placeholderTextColor={COLORS.secondary}
                    />
                </View>
                <ActionButton label="Upload Media" onPress={() => undefined} compact />
                <MediaPreviewStrip imageUrls={mediaImageUrls} />
                <TextInput
                    style={commonStyles.notesInput}
                    multiline
                    placeholder="Notes ..."
                    placeholderTextColor={COLORS.textSecondary}
                />
                <ActionButton label="Save" onPress={onSave} />
            </View>
        </>
    );
}
