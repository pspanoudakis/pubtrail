import { ReactNode, useEffect, useState } from "react";
import {router, Slot, useSegments} from "expo-router";
import { ActivityIndicator, StatusBar, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { listenToAuthChanges } from "@/redux/actions/authActions";
import { useAppDispatch, useAppSelector } from "@/redux/store/hooks";
import store from "@/redux/store/store";
import { initializeRemoteConfig } from "@/remoteConfigClient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import {useFonts} from "expo-font";
import { ThemeProvider, useTheme } from "@/styles/ThemeProvider";
import { defaultTheme } from "@/styles/themes";

const FLAG_FETCH_TIMEOUT_MS = 3000;

function AuthGate(): ReactNode {
    const { COLORS } = useTheme();
    const { sessionChecked, user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const segments = useSegments();

    useEffect(() => {
        dispatch(listenToAuthChanges());
    }, []);

    useEffect(() => {
        if (!sessionChecked) return;

        const inAppGroup = segments[0] === "(app)";
        const inAuthGroup = segments[0] === "(auth)";

        if (!user && inAppGroup) {
            router.replace("/(auth)/login");
        } else if (user && inAuthGroup) {
            router.replace("/");
        }
    }, [user, sessionChecked, segments]);

    const [fontLoaded, fontError] = useFonts({
        ...MaterialIcons.font,
        ...FontAwesome5.font,
    });

    if (!sessionChecked || !fontLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return <Slot />;
}

function AppChrome(): ReactNode {
    const { COLORS } = useTheme();

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Provider store={store}>
                <SafeAreaProvider>
                    <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
                    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={["bottom", "left", "right"]}>
                        <AuthGate />
                    </SafeAreaView>
                </SafeAreaProvider>
            </Provider>
        </GestureHandlerRootView>
    );
}

export default function RootLayout(): ReactNode {
    const [flagsResolved, setFlagsResolved] = useState(false);

    useEffect(() => {
        // The active theme comes from a feature flag, so the flags have to be
        // resolved before anything themed renders. Bounded so a slow or offline
        // network falls back to the stored values instead of hanging startup.
        const deadline = new Promise<void>((resolve) => setTimeout(resolve, FLAG_FETCH_TIMEOUT_MS));

        void Promise.race([initializeRemoteConfig(), deadline]).then(() => setFlagsResolved(true));
    }, []);

    if (!flagsResolved) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: defaultTheme.COLORS.background }}>
                <ActivityIndicator size="large" color={defaultTheme.COLORS.primary} />
            </View>
        );
    }

    return (
        <ThemeProvider>
            <AppChrome />
        </ThemeProvider>
    );
}
