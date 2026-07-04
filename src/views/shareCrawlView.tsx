import { ReactElement } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/styles/theme";
import { commonStyles } from "@/styles/commonStyles";

type ShareCrawlViewProps = {
    crawlId: string | null;
    crawlName: string | null;
    deepLink?: string | null;
    onCopyId?: () => void;
    copyFeedback?: string | null;
};

export function ShareCrawlView({
    crawlId,
    crawlName,
    deepLink,
    onCopyId,
    copyFeedback,
}: ShareCrawlViewProps): ReactElement {
    return (
        <View style={[commonStyles.screenContent, styles.container]}>
            {crawlName ? <Text style={styles.title}>{crawlName}</Text> : null}
            <Text style={styles.subtitle}>
                Ask a friend to scan this QR code to join your crawl.
            </Text>

            <View style={styles.qrCard}>
                {deepLink ? (
                    <QRCode
                        value={deepLink}
                        size={240}
                        color={COLORS.textPrimary}
                        backgroundColor={COLORS.surface}
                    />
                ) : (
                    <Text style={styles.noIdText}>
                        Save this crawl first to generate a QR code.
                    </Text>
                )}
            </View>

            {crawlId ? (
                <>
                    <Text style={styles.idLabel}>Crawl ID</Text>
                    <Pressable onPress={onCopyId} style={styles.idBox}>
                        <Text selectable style={styles.idText}>
                            {crawlId}
                        </Text>
                    </Pressable>
                    {copyFeedback ? <Text style={styles.copyFeedback}>{copyFeedback}</Text> : null}
                </>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        gap: SPACING.md,
        paddingTop: SPACING.xl,
    },
    title: {
        fontSize: TYPOGRAPHY.sizes.heading,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.textPrimary,
        textAlign: "center",
    },
    subtitle: {
        fontSize: TYPOGRAPHY.sizes.body,
        color: COLORS.textSecondary,
        textAlign: "center",
        marginBottom: SPACING.md,
    },
    qrCard: {
        backgroundColor: COLORS.surface,
        padding: SPACING.lg,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 280,
        minHeight: 280,
    },
    noIdText: {
        color: COLORS.textSecondary,
        fontSize: TYPOGRAPHY.sizes.body,
        textAlign: "center",
        paddingHorizontal: SPACING.md,
    },
    idLabel: {
        marginTop: SPACING.md,
        fontSize: TYPOGRAPHY.sizes.small,
        color: COLORS.textSecondary,
    },
    idBox: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
    },
    idText: {
        fontSize: TYPOGRAPHY.sizes.small,
        color: COLORS.textPrimary,
        fontFamily: "Courier",
    },
    copyFeedback: {
        color: COLORS.primary,
        fontSize: TYPOGRAPHY.sizes.small,
    },
});
