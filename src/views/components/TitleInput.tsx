import { TextInput, View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { commonStyles } from "@/styles/commonStyles";
import { COLORS } from "@/styles/theme";
import { ReactElement } from "react";

type TitleInputProps = {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    editable?: boolean;
};

export function TitleInput({ value, onChangeText, placeholder, editable = true }: TitleInputProps): ReactElement {
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