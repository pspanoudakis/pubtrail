import { ReactElement, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    PanResponder,
    ScrollView,
    type ScrollViewProps,
    StyleSheet,
    type StyleProp,
    type ViewStyle,
    useWindowDimensions,
    View,
} from "react-native";
import { COLORS, RADIUS, SPACING } from "@/styles/theme";

type GestureBottomSheetProps = {
    collapsedHeight: number;
    header: ReactNode | ((expanded: boolean) => ReactNode);
    children: ReactNode;
    scrollViewProps?: Omit<ScrollViewProps, "children">;
    contentContainerStyle?: ScrollViewProps["contentContainerStyle"];
    handleAreaStyle?: StyleProp<ViewStyle>;
    sheetStyle?: StyleProp<ViewStyle>;
};

function clamp(value: number, minValue: number, maxValue: number): number {
    return Math.min(Math.max(value, minValue), maxValue);
}

export function GestureBottomSheet({
    collapsedHeight,
    header,
    children,
    scrollViewProps,
    contentContainerStyle,
    handleAreaStyle,
    sheetStyle,
}: GestureBottomSheetProps): ReactElement {
    const { height: screenHeight } = useWindowDimensions();

    const [expanded, setExpanded] = useState(false);
    const translateY = useRef(new Animated.Value(collapsedHeight)).current;
    const translateYRef = useRef(collapsedHeight);
    const dragStartYRef = useRef(collapsedHeight);

    const panelHeight = Math.min(Math.max(Math.round(screenHeight * 0.74), 360), screenHeight - 24);
    const closedTranslateY = Math.max(0, panelHeight - collapsedHeight);

    useEffect(() => {
        translateYRef.current = closedTranslateY;
        translateY.setValue(closedTranslateY);
        setExpanded(false);
    }, [closedTranslateY, translateY]);

    function animatePanelTo(nextTranslateY: number) {
        const clampedTranslateY = clamp(nextTranslateY, 0, closedTranslateY);
        translateYRef.current = clampedTranslateY;

        Animated.spring(translateY, {
            toValue: clampedTranslateY,
            useNativeDriver: true,
            tension: 85,
            friction: 16,
        }).start();

        setExpanded(clampedTranslateY === 0);
    }

    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 4,
                onPanResponderGrant: () => {
                    dragStartYRef.current = translateYRef.current;
                },
                onPanResponderMove: (_, gestureState) => {
                    const nextTranslateY = clamp(
                        dragStartYRef.current + gestureState.dy,
                        0,
                        closedTranslateY
                    );
                    translateYRef.current = nextTranslateY;
                    translateY.setValue(nextTranslateY);
                },
                onPanResponderRelease: (_, gestureState) => {
                    const shouldExpand =
                        gestureState.vy < -0.35 ||
                        (gestureState.vy <= 0.35 && translateYRef.current < closedTranslateY / 2);

                    animatePanelTo(shouldExpand ? 0 : closedTranslateY);
                },
                onPanResponderTerminate: () => {
                    animatePanelTo(translateYRef.current < closedTranslateY / 2 ? 0 : closedTranslateY);
                },
            }),
        [closedTranslateY, translateY]
    );

    const resolvedHeader = typeof header === "function" ? header(expanded) : header;

    return (
        <Animated.View
            style={[
                styles.sheet,
                sheetStyle,
                {
                    height: panelHeight,
                    transform: [{ translateY }],
                },
            ]}
        >
            <View style={[styles.sheetHandleArea, handleAreaStyle]} {...panResponder.panHandlers}>
                <View style={styles.sheetGrabber} />
                {resolvedHeader}
            </View>

            <ScrollView
                style={styles.sheetScroll}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                {...scrollViewProps}
                contentContainerStyle={contentContainerStyle}
            >
                {children}
            </ScrollView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    sheet: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        borderTopLeftRadius: RADIUS.lg,
        borderTopRightRadius: RADIUS.lg,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: "hidden",
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 18,
        zIndex: 100,
    },
    sheetHandleArea: {
        paddingHorizontal: SPACING._20,
        paddingTop: SPACING._10,
        paddingBottom: 4,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: COLORS.divider,
        backgroundColor: "rgba(255, 249, 239, 0.95)",
    },
    sheetGrabber: {
        alignSelf: "center",
        width: 48,
        height: 5,
        borderRadius: 999,
        backgroundColor: COLORS.border,
        marginBottom: SPACING._10,
    },
    sheetScroll: {
        flex: 1,
    },
});
