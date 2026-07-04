import { ReactElement, useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Platform } from "react-native";
import {ExternalJoinPresenter} from "@/presenters/externalJoinPresenter";

export default function JoinExternalLinkRoute(): ReactElement {
    const params = useLocalSearchParams<{ code?: string | string[] }>();
    const code = typeof params.code === "string" ? params.code : undefined;
    console.log(code);
    console.log(params);
    console.log("Received code from deep link:", code);

    useEffect(() => {
        if (!code) {
            router.replace("/");
            return;
        }

        if (Platform.OS === "web") {
            window.location.href = `pubtrail://join/${encodeURIComponent(code)}`;
            return;
        }

        router.replace({
            pathname: "/joinCrawl",
            params: {crawlId: code},
        });
    }, [code]);
    return <ExternalJoinPresenter code={code}/>
}
