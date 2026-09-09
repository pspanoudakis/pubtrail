import {
    fetchAndActivate,
    getRemoteConfig,
    getValue,
} from "firebase/remote-config";
import { firebaseApp } from "@/firebaseConfig";
import { cacheFeatureFlags, collectFlagValues, FEATURE_FLAG_DEFAULTS } from "@/featureFlags";

/**
 * Web half of the Remote Config client. The native half lives in
 * `remoteConfigClient.ts`; Metro picks this file for web builds. Both expose
 * the same `initializeRemoteConfig` contract and write into the same store.
 */

type RemoteConfigInstance = ReturnType<typeof getRemoteConfig>;

let remoteConfig: RemoteConfigInstance | null = null;

const getInstance = (): RemoteConfigInstance | null => {
    // The web SDK needs IndexedDB, which is missing during the static render.
    if (typeof indexedDB === "undefined") {
        return null;
    }

    if (!remoteConfig) {
        remoteConfig = getRemoteConfig(firebaseApp);
        remoteConfig.defaultConfig = FEATURE_FLAG_DEFAULTS;
        // Remote Config serves its cached response until this interval elapses,
        // and the 12h default is far too slow to flip a flag during a demo.
        remoteConfig.settings.minimumFetchIntervalMillis = 0;
    }

    return remoteConfig;
};

const publishValues = (config: RemoteConfigInstance): void => {
    cacheFeatureFlags(collectFlagValues((key) => getValue(config, key).asBoolean()));
};

export const initializeRemoteConfig = async (): Promise<void> => {
    const config = getInstance();

    if (!config) {
        return;
    }

    try {
        await fetchAndActivate(config);
        publishValues(config);
    } catch (error) {
        console.warn("Remote Config fetch failed, keeping the cached feature flags.", error);
    }
};
