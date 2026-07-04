import { Stack } from "expo-router";
import { ReactElement } from "react";
import { COLORS, TYPOGRAPHY } from "@/styles/theme";
import BackButton from "@/views/components/BackButton";


export default function AppGroupLayout(): ReactElement {
    return (
        <Stack
            screenOptions={{
                headerTitleAlign: "center",
                headerLeft: () => <BackButton />,
                // Styling the header globally for the app group
                headerStyle: {
                    backgroundColor: COLORS.surface,

                },
                headerTintColor: COLORS.primary,
                headerTitleStyle: {
                    fontWeight: TYPOGRAPHY.weights.bold,
                    color: COLORS.textPrimary,
                    fontSize: TYPOGRAPHY.sizes.subtitle,
                },
            }}
        >
            {/* Define specific screens if you want to override titles or behavior */}
            <Stack.Screen
                name="activeCrawl/index"
                options={{ title: "Active Crawl" }}
            />
            <Stack.Screen
                name="newCrawl"
                options={{ title: "Create New Crawl" }}
            />
            <Stack.Screen
                name="crawlHistory"
                options={{ title: "Crawl History" }}
            />
            <Stack.Screen
                name="nearbyCrawls"
                options={{ title: "Nearby" }}
            />
            <Stack.Screen
                name="soberCheck"
                options={{ title: "Sober Check" }}
            />
            <Stack.Screen
                name="viewCrawl/[crawlUid]/index"
                options={{ title: "Crawl Details" }}
            />
            <Stack.Screen
                name="viewCrawl/[crawlUid]/stops/[stopUid]"
                options={{ title: "View Stop" }}
            />
            <Stack.Screen
                name="activeCrawl/stops/[stopUid]"
                options={{ title: "Edit Stop" }}
            />
            <Stack.Screen
                name="activeCrawl/newStop"
                options={{ title: "Add Stop" }}
            />
            <Stack.Screen
                name="activeCrawl/captureMedia"
                options={{ title: "Capture Media" }}
            />
            <Stack.Screen
                name="album/[crawlUid]"
                options={{ title: "Album" }}
            />
            <Stack.Screen name="shareCrawl" options={{ title: "Share Crawl" }} />
            <Stack.Screen name="joinCrawl" options={{ title: "Join Crawl" }} />
            <Stack.Screen name="join/[code]" options={{ title: "Join from External Link" }} />
        </Stack>
    );
}
