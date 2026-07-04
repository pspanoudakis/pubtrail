import {Drawer} from "expo-router/drawer";
import {ReactElement} from "react";
import {COLORS} from "@/styles/theme";
import {AppDrawerContent} from "./AppDrawerContent";

type AppLayoutViewProps = {
    isLoggedIn: boolean,
    userName: string,
    userPhotoUrl: string | null,
    onLogoutPress: () => void,
    onLoginPress: () => void,
    isActiveCrawl: boolean
};

export function AppLayoutView(props: AppLayoutViewProps): ReactElement {
    return (
        <Drawer
            initialRouteName={"index"}
            drawerContent={(drawerProps) => (
                <AppDrawerContent
                    drawerProps={drawerProps}
                    userName={props.userName}
                    userPhotoUrl={props.userPhotoUrl}
                    onLogoutPress={props.onLogoutPress}
                    onLoginPress={props.onLoginPress}
                    isLoggedIn={props.isLoggedIn}
                    isActiveCrawl={props.isActiveCrawl}
                />
            )}
            screenOptions={{
                headerStyle: {backgroundColor: COLORS.surface},
                headerTintColor: COLORS.textPrimary,
            }}
        >
            <Drawer.Screen name="index" options={{drawerLabel: "Map", title: "PubTrail", headerShown: false}}/>
        </Drawer>
    );
}





