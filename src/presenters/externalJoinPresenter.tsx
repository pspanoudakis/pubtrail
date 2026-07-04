import { ReactElement, useEffect } from "react";
import { ExternalJoinView } from "@/views/ExternalJoinView";
import { Redirect, router } from "expo-router";
import { Platform } from "react-native";

interface ExternalJoinPresenterProps {
    code?: string;
}

export function ExternalJoinPresenter(props: ExternalJoinPresenterProps): ReactElement {
    const code = props.code;

    if (!code) {
        return <Redirect href={'/'} />;
    }

    useEffect(() => {
        // Auto-attempt to open native app on web
        if (Platform.OS === 'web' && code) {
                    window.location.href = `pubtrail://join/${code}`;

        }
    }, [code]);

    function handleOpen() {
        window.location.href = `pubtrail://join/${(code)}`;
        }

    function handleJoinBrowser() {
        router.replace({ pathname: '/joinCrawl', params: { crawlId: code } });
    }

    return <ExternalJoinView code={code} onOpen={handleOpen} onJoinBrowser={handleJoinBrowser} />;
}