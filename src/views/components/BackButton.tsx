import React from "react";
import { Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router"; // Add useNavigation
import type { ReactElement } from "react";
import { useTheme } from "@/styles/ThemeProvider";

export default function BackButton(): ReactElement {
    const { COLORS } = useTheme();

    const navigation = useNavigation();

    function onPress() {
        if (navigation.canGoBack()) {
            router.back();
        } else {
            router.replace("/");
        }
    }

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                { padding: 8 },
                pressed && { opacity: 0.7 }
            ]}
        >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
        </Pressable>
    );
}