import {ReactElement} from "react";
import {StyleSheet, Text, View} from "react-native";
import {COLORS, SPACING, TYPOGRAPHY} from "@/styles/theme";
import {ActionButton} from "@/views/components/ActionButton";
import {commonStyles} from "@/styles/commonStyles";

export type GamePhase = "idle" | "countdown" | "playing" | "result";

type Verdict = {
    emoji: string;
    label: string;
    detail: string;
};

type SoberCheckViewProps = {
    phase: GamePhase,
    countdown: number,
    timeLeft: number,
    ballPos: { x: number; y: number },
    ringCenter: { x: number; y: number },
    outerRadius: number,
    score: number,
    verdict: Verdict,
    onStart: () => void,
    onRetry: () => void,
    onCancel: () => void,
    gameEnabled: boolean
};

const ARENA_SIZE = 260;
const BALL_SIZE = 24;

export function SoberCheckView({
                                   phase,
                                   countdown,
                                   timeLeft,
                                   ballPos,
                                   ringCenter,
                                   outerRadius,
                                   score,
                                   verdict,
                                   onStart,
                                   onRetry,
                                   onCancel,
                                   gameEnabled
                               }: SoberCheckViewProps): ReactElement {

        if (!gameEnabled) {
            return (
                <View style={[commonStyles.screenContent, styles.fallbackContainer]}>
                    <Text style={styles.title}>How Sober Are You?</Text>
                    <Text style={styles.subtitle}>This feature is only available on the mobile app.</Text>
                    <Text style={styles.subtitle}>Drink responsibly!</Text>
                    <ActionButton label="Go Back" onPress={onCancel} />
                </View>
            );
        }
        else return (
        <View style={styles.container}>
            {phase === "idle" ? renderIdleACB() : null}
            {phase === "countdown" ? renderCountdownACB() : null}
            {phase === "playing" ? renderPlayingACB() : null}
            {phase === "result" ? renderResultACB() : null}
        </View>
    );

    function renderIdleACB(): ReactElement {
        return (
            <View style={styles.centered}>
                <Text style={styles.bigEmoji}>🍻</Text>
                <Text style={styles.title}>How Sober Are You?</Text>
                <Text style={styles.description}>
                    Hold your phone and keep the ball inside the moving circle.
                    The steadier you are, the higher your score!
                </Text>
                <View style={styles.buttonWrap}>
                    <ActionButton label="Start Challenge" onPress={onStart}/>
                </View>
            </View>
        );
    }

    function renderCountdownACB(): ReactElement {
        return (
            <View style={styles.centered}>
                <Text style={styles.countdownLabel}>Get ready…</Text>
                <Text style={styles.countdownNumber}>{countdown}</Text>
                <Text style={styles.description}>Hold your phone steady!</Text>
            </View>
        );
    }

    function renderPlayingACB(): ReactElement {
        const ringCX = ((ringCenter.x + 1) / 2) * ARENA_SIZE;
        const ringCY = ((ringCenter.y + 1) / 2) * ARENA_SIZE;
        const outerDiam = outerRadius * ARENA_SIZE;

        const ballLeft = ((ballPos.x + 1) / 2) * ARENA_SIZE - BALL_SIZE / 2;
        const ballTop = ((ballPos.y + 1) / 2) * ARENA_SIZE - BALL_SIZE / 2;

        const dx = ballPos.x - ringCenter.x;
        const dy = ballPos.y - ringCenter.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const isInside = dist <= outerRadius;

        return (
            <View style={styles.centered}>
                <Text style={styles.timer}>{timeLeft}s</Text>

                <View style={styles.arena}>
                    {/* Moving target circle */}
                    <View
                        style={[
                            styles.targetCircle,
                            {
                                width: outerDiam,
                                height: outerDiam,
                                borderRadius: outerDiam / 2,
                                left: ringCX - outerDiam / 2,
                                top: ringCY - outerDiam / 2,
                            },
                        ]}
                    />
                    {/* Ball */}
                    <View
                        style={[
                            styles.ball,
                            isInside ? styles.ballInside : styles.ballOutside,
                            {left: ballLeft, top: ballTop},
                        ]}
                    />
                </View>

                <Text style={styles.hint}>
                    {isInside ? "✅ Steady…" : "⚠️ Stay in the circle!"}
                </Text>
            </View>
        );
    }

    function renderResultACB(): ReactElement {
        return (
            <View style={styles.centered}>
                <Text style={styles.bigEmoji}>{verdict.emoji}</Text>
                <Text style={styles.title}>{verdict.label}</Text>
                <Text style={styles.scoreText}>{score}%</Text>
                <Text style={styles.description}>{verdict.detail}</Text>
                <View style={styles.buttonWrap}>
                    <ActionButton label="Try Again" onPress={onRetry}/>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    centered: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: SPACING.xl,
    },
    bigEmoji: {
        fontSize: 56,
        marginBottom: SPACING.sm,
    },
    title: {
        fontSize: TYPOGRAPHY.sizes.title,
        fontWeight: TYPOGRAPHY.weights.bold as "700",
        color: COLORS.textPrimary,
        textAlign: "center",
        marginBottom: SPACING.xs,
    },
    description: {
        fontSize: TYPOGRAPHY.sizes.body,
        color: COLORS.textSecondary,
        textAlign: "center",
        lineHeight: 22,
        marginBottom: SPACING.md,
        paddingHorizontal: SPACING.md,
    },
    buttonWrap: {
        width: "100%",
        marginTop: SPACING.sm,
    },
    countdownLabel: {
        fontSize: TYPOGRAPHY.sizes.heading,
        color: COLORS.textSecondary,
        fontWeight: TYPOGRAPHY.weights.medium as "500",
        marginBottom: SPACING._12,
    },
    countdownNumber: {
        fontSize: 72,
        fontWeight: TYPOGRAPHY.weights.bold as "700",
        color: COLORS.primary,
        marginBottom: SPACING._12,
    },
    timer: {
        fontSize: TYPOGRAPHY.sizes.display,
        fontWeight: TYPOGRAPHY.weights.bold as "700",
        color: COLORS.primary,
        marginBottom: SPACING._14,
    },
    arena: {
        width: ARENA_SIZE,
        height: ARENA_SIZE,
        borderRadius: ARENA_SIZE / 2,
        borderWidth: 2,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surface,
        overflow: "hidden",
        position: "relative",
    },
    targetCircle: {
        position: "absolute",
        borderWidth: 2,
        borderColor: COLORS.success,
        backgroundColor: "rgba(16, 185, 129, 0.10)",
    },
    ball: {
        position: "absolute",
        width: BALL_SIZE,
        height: BALL_SIZE,
        borderRadius: BALL_SIZE / 2,
    },
    ballInside: {
        backgroundColor: COLORS.primary,
    },
    ballOutside: {
        backgroundColor: COLORS.error,
    },
    hint: {
        marginTop: SPACING._14,
        fontSize: TYPOGRAPHY.sizes.body,
        fontWeight: TYPOGRAPHY.weights.semibold as "600",
        color: COLORS.textSecondary,
    },
    scoreText: {
        fontSize: 48,
        fontWeight: TYPOGRAPHY.weights.bold as "700",
        color: COLORS.primary,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: TYPOGRAPHY.sizes.body,
        color: COLORS.textSecondary,
        textAlign: "center",
    },
    fallbackContainer: {
        flex: 1,
        gap: SPACING.md,
        alignItems: "center",
        justifyContent: "center",
    },
});
