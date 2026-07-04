import { ReactNode, useEffect } from "react";
import {router, Slot, useSegments} from "expo-router";
import { ActivityIndicator, StatusBar, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { listenToAuthChanges } from "@/redux/actions/authActions";
import { useAppDispatch, useAppSelector } from "@/redux/store/hooks";
import store from "@/redux/store/store";
import { COLORS } from "@/styles/theme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import {useFonts} from "expo-font";

function AuthGate(): ReactNode {
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

export default function RootLayout(): ReactNode {
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
