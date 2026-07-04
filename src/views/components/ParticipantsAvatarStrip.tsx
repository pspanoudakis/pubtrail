import React, { ReactElement, useEffect, useState } from "react";
import { View, Image, Text, StyleSheet, ImageStyle, StyleProp, Platform } from "react-native";
import { COLORS } from "@/styles/theme";
import { FallBackUserAvatar } from "./FallbackUserAvatar";

export const MAX_VISIBLE_PARTICIPANTS = 3;

export type ParticipantsAvatarStripProps = {
    avatarUrls: string[];
};

type AvatarImageProps = {
    uri: string;
    style: StyleProp<ImageStyle>;
};

const AvatarImage = ({ uri, style }: AvatarImageProps): ReactElement => {
    const [showFallback, setShowFallback] = useState(!uri);

    useEffect(() => {
        let isEffectActive = true;
        const getEffectInactiveSetter = () => (
            () => { isEffectActive = false; }
        );

        if (!uri) {
            setShowFallback(true);
            return getEffectInactiveSetter()
        }

        setShowFallback(false);

        if (Platform.OS === "web")
            return getEffectInactiveSetter();

        Image.prefetch(uri)
            .then((didPrefetch) => {
                if (!isEffectActive) return;
                if (!didPrefetch) setShowFallback(true);
            })
            .catch(() => {
                if (isEffectActive) setShowFallback(true);
            });

        return getEffectInactiveSetter()
    }, [uri]);

    return (
        showFallback ? (
            <FallBackUserAvatar style={style} />
        ) : (
            <Image
                source={{ uri }}
                style={style}
                onError={() => setShowFallback(true)}
            />
        )
    );
};

export function ParticipantsAvatarStrip({ avatarUrls }: ParticipantsAvatarStripProps): ReactElement | null {
    if (!avatarUrls.length) {
        return null;
    }

    const visibleAvatars = avatarUrls.slice(0, MAX_VISIBLE_PARTICIPANTS);
    const extraCount = avatarUrls.length - visibleAvatars.length;

    return (
        <View style={styles.avatarRow}>
            {visibleAvatars.map((avatarUrl, index) => (
                <AvatarImage
                    key={`${avatarUrl}-${index}`}
                    uri={avatarUrl}
                    style={[styles.avatarBase, index > 0 ? styles.avatarOverlap : null]}
                />
            ))}
            {extraCount > 0 ? (
                <View style={[styles.avatarMoreBadge, styles.avatarOverlap]}>
                    <Text style={styles.avatarMoreText}>+{extraCount}</Text>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    avatarRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 2,
    },
    avatarOverlap: {
        marginLeft: -10,
    },
    avatarBase: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: COLORS.background,
    },
    avatarMoreBadge: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surface,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarMoreText: {
        fontSize: 14,
        fontWeight: "700",
        color: COLORS.textSecondary,
    },
});