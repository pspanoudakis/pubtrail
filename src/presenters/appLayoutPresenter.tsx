import {
    startLoggedUserActiveCrawlSync,
    stopLoggedUserActiveCrawlSync,
} from "@/redux/actions/activeCrawlActions";
import { logout } from "@/redux/actions/authActions";
import { setWeatherFromService } from "@/redux/actions/weatherActions";
import { useAppDispatch, useAppSelector } from "@/redux/store/hooks";
import { AppLayoutView } from "@/views/navigation/AppLayoutView";
import { ReactElement, useEffect } from "react";
import { Alert, Platform } from "react-native";
import {selectHasActiveCrawl} from "@/redux/selectors/activeCrawlSelectors";
import { router } from "expo-router";

const WEATHER_REFRESH_MS = 5 * 60 * 1000;

export function AppLayoutPresenter(): ReactElement {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const userLocation = useAppSelector((state) => state.map.userLocation);
    const hasActiveCrawl = useAppSelector(selectHasActiveCrawl);

    useEffect(() => {
        dispatch(startLoggedUserActiveCrawlSync());

        return () => {
            dispatch(stopLoggedUserActiveCrawlSync());
        };
    }, [dispatch]);

    useEffect(() => {
        function loadWeather() {
            dispatch(setWeatherFromService(userLocation.latitude, userLocation.longitude));
        }

        loadWeather();
        const intervalId = setInterval(loadWeather, WEATHER_REFRESH_MS);

        return () => {
            clearInterval(intervalId);
        };
    }, [dispatch, userLocation.latitude, userLocation.longitude]);

    function onLoginPress() {
        router.push("(auth)/login");
    }

    function onLogoutPress() {
        if (Platform.OS === "web") {
            window.confirm("Are you sure you want to log out?") && dispatch(logout());
            return;
        }

        Alert.alert("Log out", "Are you sure you want to log out?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Log out",
                style: "destructive",
                onPress: () => dispatch(logout()),
            },
        ]);
    }

    return (
        <AppLayoutView
            userName={user?.displayName ?? user?.email ?? "PubTrail user"}
            userPhotoUrl={user?.photoURL ?? null}
            onLogoutPress={onLogoutPress}
            onLoginPress={onLoginPress}
            isLoggedIn={Boolean(user)}
            isActiveCrawl={hasActiveCrawl}
        />
    );
}





