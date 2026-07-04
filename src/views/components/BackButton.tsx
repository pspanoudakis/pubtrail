import React from "react";
import { Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router"; // Add useNavigation
import { COLORS } from "@/styles/theme";
import type { ReactElement } from "react";

export default function BackButton(): ReactElement {

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