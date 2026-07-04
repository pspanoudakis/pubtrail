import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {Image} from "expo-image";
import {DrawerContentComponentProps, DrawerContentScrollView} from "@react-navigation/drawer";
import {ReactElement, useMemo} from "react";
import {Pressable, StyleSheet, Text, View} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {COLORS, RADIUS, SPACING, TYPOGRAPHY} from "@/styles/theme";
import {router} from "expo-router";

type DrawerEntry = {
    routeName: string;
    label: string;
    description: string;
    icon: React.ComponentProps<typeof MaterialIcons>["name"];
};
// ShowDuringCrawl: true - only while crawl is active, false - only when crawl inactive, undefined - always show
const DRAWER_GROUPS: Array<{ title: string; showDuringCrawl?: boolean; items: DrawerEntry[] }> = [
    {
        title: "Navigate",
        items: [
            {
                routeName: "/",
                label: "Map",
                description: "Return to the full-screen map",
                icon: "map",
            },
        ]
    },
    {
        title: "Find a crawl",
        showDuringCrawl: false,
        items: [
            {
                routeName: "(app)/newCrawl",
                label: "New Crawl",
                description: "Start a fresh crawl",
                icon: "add-box",
            },
            {
                routeName: "(app)/joinCrawl",
                label: "Join Crawl",
                description: "Open the placeholder join flow",
                icon: "qr-code-scanner",
            },
            {
                routeName: "(app)/nearbyCrawls",
                label: "Nearby Crawls",
                description: "Explore crawls close to you",
                icon: "place",
            },
        ]
    },
    {
        title: "My Crawl",
        showDuringCrawl: true,
        items: [
            {
                routeName: "(app)/activeCrawl",
                label: "My Active Crawl",
                description: "Open the active crawl dashboard",
                icon: "directions-walk",
            },
            {
                routeName: "(app)/shareCrawl",
                label: "Share Crawl",
                description: "Share your current crawl with others",
                icon: "share"
            }
        ]
    },
    {
        title: "Advanced",
        items: [
            {
                routeName: "(app)/crawlHistory",
                label: "Crawl History",
                description: "Review crawls you joined",
                icon: "history",
            },
            {
                routeName: "soberCheck",
                label: "Sober Check",
                description: "Quick self-check before heading out",
                icon: "local-bar",
            },

        ],
    },
];

type AppDrawerContentProps = {
    drawerProps: DrawerContentComponentProps,
    userName: string,
    userPhotoUrl: string | null,
    onLogoutPress: () => void,
    onLoginPress: () => void,
    isLoggedIn: boolean,
    isActiveCrawl: boolean
};

export function AppDrawerContent({
    drawerProps,
    userName,
    userPhotoUrl,
    onLogoutPress,
    onLoginPress,
    isLoggedIn,
    isActiveCrawl
}: AppDrawerContentProps): ReactElement {
    const insets = useSafeAreaInsets();
    const activeRouteName = useMemo(() => {
        const routeName = drawerProps.state.routeNames[drawerProps.state.index] ?? "/";
        return routeName === "index" ? "/" : routeName;
    }, [drawerProps.state.routeNames, drawerProps.state.index]);

    function onNavigate(routeName: string) {
        router.navigate(routeName);
        drawerProps.navigation.closeDrawer();
    }

    return (
        <DrawerContentScrollView
            {...drawerProps}
            contentContainerStyle={{paddingBottom: insets.bottom + SPACING._12}}
        >
            <View style={styles.headerRow}>
                <View style={styles.profileRow}>
                    <View style={styles.avatar}>
                        {userPhotoUrl ? (
                            <Image source={{uri: userPhotoUrl}} style={styles.avatarImage}/>
                        ) : (
                            <MaterialIcons name="account-circle" size={46} color={COLORS.primary}/>
                        )}
                    </View>
                    <View style={styles.headerTextGroup}>
                        <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
                    </View>
                </View>
                <Pressable onPress={drawerProps.navigation.closeDrawer} hitSlop={10} style={styles.closeButton}>
                    <MaterialIcons name="close" size={22} color={COLORS.textPrimary}/>
                </Pressable>
            </View>

            <View style={styles.sectionsWrap}>
                {DRAWER_GROUPS.filter(item => item.showDuringCrawl === undefined || item.showDuringCrawl === isActiveCrawl).map((group) => (
                    <View key={group.title} style={styles.section}>
                        <Text style={styles.sectionTitle}>{group.title}</Text>
                        <View style={styles.sectionItems}>
                            {group.items.map((item) => {
                                const isActive = activeRouteName === item.routeName;

                                return (
                                    <Pressable
                                        key={item.routeName}
                                        onPress={() => onNavigate(item.routeName)}
                                        style={({pressed}) => [
                                            styles.item,
                                            isActive ? styles.itemActive : null,
                                            pressed ? styles.itemPressed : null,
                                        ]}
                                    >
                                        <View style={styles.iconWrap}>
                                            <MaterialIcons name={item.icon} size={20} color={COLORS.primary}/>
                                        </View>
                                        <View style={styles.itemTextGroup}>
                                            <Text style={styles.itemTitle}>{item.label}</Text>
                                            <Text style={styles.itemDescription}>{item.description}</Text>
                                        </View>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                ))}
            </View>

            {isLoggedIn ? (
                <View style={styles.loginLogoutWrap}>
                    <Pressable
                        onPress={onLogoutPress}
                        style={({pressed}) => [
                            styles.item,
                            styles.itemDestructive,
                            pressed ? styles.itemPressed : null
                        ]}
                    >
                        <View style={[styles.iconWrap, styles.iconWrapDestructive]}>
                            <MaterialIcons name="logout" size={20} color={COLORS.error}/>
                        </View>
                        <View style={styles.itemTextGroup}>
                            <Text style={[styles.itemTitle, styles.itemTitleDestructive]}>Log out</Text>
                            <Text style={styles.itemDescription}>Sign out of PubTrail</Text>
                        </View>
                    </Pressable>
                </View>
            ) : (
                <View style={styles.loginLogoutWrap}>
                    <Pressable
                        onPress={onLoginPress}
                        style={({pressed}) => [
                            styles.item,
                            pressed ? styles.itemPressed : null
                        ]}
                    >
                        <View style={[styles.iconWrap]}>
                            <MaterialIcons name="login" size={20} color={COLORS.primaryDark}/>
                        </View>
                        <View style={styles.itemTextGroup}>
                            <Text style={[styles.itemTitle]}>Log in</Text>
                            <Text style={styles.itemDescription}>Sign in to PubTrail</Text>
                        </View>
                    </Pressable>
                </View>
            )}
        </DrawerContentScrollView>
    );
}

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: SPACING._12,
        paddingHorizontal: SPACING._12,
        paddingBottom: SPACING._12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: COLORS.border,
    },
    profileRow: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING._10,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.pill,
        backgroundColor: COLORS.background,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    avatarImage: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.pill,
    },
    headerTextGroup: {
        flex: 1,
        gap: 2,
    },
    userName: {
        color: COLORS.textPrimary,
        fontSize: TYPOGRAPHY.sizes.subtitle,
        fontWeight: "700",
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: TYPOGRAPHY.sizes.small,
    },
    closeButton: {
        width: 34,
        height: 34,
        borderRadius: RADIUS.pill,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.background,
    },
    sectionsWrap: {
        paddingTop: SPACING._10,
        paddingHorizontal: SPACING._12,
        gap: SPACING._20,
    },
    section: {
        gap: SPACING.sm,
    },
    sectionTitle: {
        color: COLORS.textSecondary,
        fontSize: TYPOGRAPHY.sizes.small,
        fontWeight: "700",
        letterSpacing: 0.6,
        textTransform: "uppercase",
    },
    sectionItems: {
        gap: SPACING.sm,
    },
    loginLogoutWrap: {
        marginHorizontal: SPACING._12,
        marginTop: SPACING._10,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: COLORS.border,
        paddingTop: SPACING._10,
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING._10,
        paddingHorizontal: SPACING._12,
        paddingVertical: SPACING._10,
        borderRadius: RADIUS.lg,
        backgroundColor: "transparent",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "transparent",
    },
    itemActive: {
        backgroundColor: COLORS.background,
        borderColor: COLORS.border,
    },
    itemPressed: {
        opacity: 0.85,
    },
    itemDestructive: {
        backgroundColor: "rgba(239, 68, 68, 0.06)",
        borderColor: "rgba(239, 68, 68, 0.18)",
    },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: RADIUS.pill,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.background,
    },
    iconWrapDestructive: {
        backgroundColor: "rgba(239, 68, 68, 0.08)",
    },
    itemTextGroup: {
        flex: 1,
        gap: 2,
    },
    itemTitle: {
        color: COLORS.textPrimary,
        fontSize: TYPOGRAPHY.sizes.body,
        fontWeight: "700",
    },
    itemTitleDestructive: {
        color: COLORS.error,
    },
    itemDescription: {
        color: COLORS.textSecondary,
        fontSize: TYPOGRAPHY.sizes.small,
        lineHeight: 18,
    },
});




