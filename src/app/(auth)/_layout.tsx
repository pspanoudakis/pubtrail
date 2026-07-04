import { Stack } from "expo-router";
import { ReactElement } from "react";

export default function AuthLayout(): ReactElement {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" />
        </Stack>
    );
}

