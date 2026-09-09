import { TextInput, View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useCommonStyles } from "@/styles/useCommonStyles";
import { ReactElement } from "react";
import { useTheme } from "@/styles/ThemeProvider";

type TitleInputProps = {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    editable?: boolean;
};

export function TitleInput({ value, onChangeText, placeholder, editable = true }: TitleInputProps): ReactElement {
    const commonStyles = useCommonStyles();
    const { COLORS } = useTheme();
    return (
        <View style={commonStyles.formTitleRow}>
            <FontAwesome5 name={editable ? "pencil-alt" : "glass-cheers"} size={20} color={COLORS.icon} />
            <TextInput
                style={commonStyles.formTitleInput}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={COLORS.textSecondary}
                editable={editable}
            />
        </View>
    );
}