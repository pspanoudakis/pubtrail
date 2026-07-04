import { ReactElement } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, ScrollView, Text, View } from "react-native";
import { COLORS } from "@/styles/theme";
import { commonStyles } from "@/styles/commonStyles";
import { ScreenLoader } from "@/views/components/ScreenLoader";
import { ActionButton } from "@/views/components/ActionButton";
import { CrawlHistoryItem } from "../types/crawlHistoryItem";
import { pluralize } from "./shared/shared";

type CrawlHistoryViewProps = {
    isLoading?: boolean;
    crawls: CrawlHistoryItem[];
    onSelectCrawl: (crawlId: string) => void;
    onNewPubCrawl: () => void;
};

export function CrawlHistoryView({
    isLoading = false,
    crawls,
    onSelectCrawl,
    onNewPubCrawl,
}: CrawlHistoryViewProps): ReactElement {
    if (isLoading) {
        return <ScreenLoader label="Loading crawl history..." />;
    }

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
            <View style={[commonStyles.screenContent, commonStyles.contentGap14]}>
                {crawls.length === 0 ? (
                    <Text style={commonStyles.subtleText}>No crawl history yet.</Text>
                ) : null}
                {crawls.map((crawl) => (
                    <Pressable key={crawl.id} style={commonStyles.card} onPress={() => onSelectCrawl(crawl.id)}>
                        <Text style={commonStyles.cardTitle}>{crawl.title}</Text>
                        <Text style={commonStyles.cardMeta}>{
                            `${crawl.date} - ${crawl.participants} ${pluralize(
                                crawl.participants, "participant", "participants"
                            )}`
                        }</Text>
                        <Text style={commonStyles.cardMeta}>{
                            `${crawl.visitedPubs} ${pluralize(
                                crawl.visitedPubs, "pub", "pubs"
                            )} visited`
                        }</Text>
                    </Pressable>
                ))}
                <ActionButton
                    label="New Pub Crawl"
                    onPress={onNewPubCrawl}
                    icon={<MaterialIcons name="add" size={22} color={COLORS.surface} />}
                />
            </View>
        </ScrollView>
    );
}

