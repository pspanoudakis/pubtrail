import {Drawer} from "expo-router/drawer";
import {ReactElement} from "react";
import {AppDrawerContent} from "./AppDrawerContent";
import { useTheme } from "@/styles/ThemeProvider";

type AppLayoutViewProps = {
    isLoggedIn: boolean,
    userName: string,
    userPhotoUrl: string | null,
    onLogoutPress: () => void,
    onLoginPress: () => void,
    isActiveCrawl: boolean
};

export function AppLayoutView(props: AppLayoutViewProps): ReactElement {
    const { COLORS } = useTheme();
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





