import { ReactElement } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { commonStyles } from "@/styles/commonStyles";
import { ScreenLoader } from "@/views/components/ScreenLoader";
import { RefreshIndicator } from "@/views/components/RefreshIndicator";

export type NearbyCrawlCard = {
    id: string;
    title: string;
    participants: string;
    distance: string;
};

type NearbyCrawlsViewProps = {
    crawls: NearbyCrawlCard[];
    isLoading: boolean;
    isRefreshing: boolean;
    errorMessage: string | null;
    onRefresh: () => void;
    onSelectCrawl: (crawlId: string) => void;
};

export function NearbyCrawlsView({
    crawls,
    isLoading,
    isRefreshing,
    errorMessage,
    onRefresh,
    onSelectCrawl,
}: NearbyCrawlsViewProps): ReactElement {
    if (isLoading) {
        return <ScreenLoader label="Loading nearby crawls..." />;
    }

    return (
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshControl={
                <RefreshIndicator refreshing={isRefreshing} onRefresh={onRefresh}/>
            }
        >
            <View style={[commonStyles.screenContent, commonStyles.contentGap14]}>
                {errorMessage ? <Text style={commonStyles.cardMeta}>{errorMessage}</Text> : null}
                {!errorMessage && crawls.length === 0 ? (
                    <Text style={commonStyles.cardMeta}>No nearby crawls found.</Text>
                ) : null}
                {crawls.map((crawl) => (
                    <Pressable key={crawl.id} style={commonStyles.card} onPress={() => onSelectCrawl(crawl.id)}>
                        <Text style={[commonStyles.cardTitle, styles.cardTitle]}>{crawl.title}</Text>
                        <Text style={commonStyles.cardMeta}>{crawl.participants}</Text>
                        <Text style={commonStyles.cardMeta}>{crawl.distance}</Text>
                    </Pressable>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    cardTitle: {
        fontSize: 19,
        marginBottom: 4,
    },
});
