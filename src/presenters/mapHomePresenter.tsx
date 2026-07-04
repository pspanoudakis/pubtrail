import { ReactElement } from "react";
import { router } from "expo-router";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { selectHasActiveCrawl } from "@/redux/selectors/activeCrawlSelectors";
import { useAppSelector } from "@/redux/store/hooks";
import { MapPresenter } from "@/presenters/mapPresenter";
import { IndexQuickActionsOverlay } from "@/views/navigation/IndexQuickActionsOverlay";
import { View } from "react-native";

export function MapHomePresenter(): ReactElement {
    const navigation = useNavigation();
    const hasActiveCrawl = useAppSelector(selectHasActiveCrawl);
    const weatherTemp = useAppSelector((state) => state.weather.data?.temp ?? null);

    function onMenuPress() {
        navigation.dispatch(DrawerActions.openDrawer());
    }

    return (
        <View style={{ flex: 1 }}>
            <MapPresenter />
            <IndexQuickActionsOverlay
                hasActiveCrawl={hasActiveCrawl}
                weatherTemp={weatherTemp}
                onMenuPress={onMenuPress}
                onPrimaryPress={() => router.navigate(hasActiveCrawl ? "/activeCrawl" : "/newCrawl")}
                onNearbyPress={() => router.navigate("/nearbyCrawls")}
                onJoinPress={() => router.navigate("/joinCrawl")}
                onSharePress={() => router.navigate("/shareCrawl")}
                onPhotoPress={() => router.navigate("/activeCrawl/captureMedia")}
            />
        </View>
    );
}


