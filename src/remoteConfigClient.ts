import {
    fetchAndActivate,
    getRemoteConfig,
    getValue,
} from "@react-native-firebase/remote-config";
import { cacheFeatureFlags, collectFlagValues, FEATURE_FLAG_DEFAULTS } from "@/featureFlags";

/**
 * Native half of the Remote Config client, backed by React Native Firebase.
 * Metro picks `remoteConfigClient.web.ts` for web builds instead. Both expose
 * the same `initializeRemoteConfig` contract and write into the same store.
 *
 * Unlike the web SDK, the native SDK persists its activated config itself, so a
 * cold start has the last known values available without waiting for a fetch.
 */

type RemoteConfigInstance = ReturnType<typeof getRemoteConfig>;

let remoteConfig: RemoteConfigInstance | null = null;

const getInstance = (): RemoteConfigInstance => {
    if (!remoteConfig) {
        remoteConfig = getRemoteConfig();
        // Both are setters that forward to the native SDK, so each has to be
        // assigned whole - mutating a nested property would not propagate.
        remoteConfig.defaultConfig = FEATURE_FLAG_DEFAULTS;
        // Matches the web client: skip the fetch throttle so a published flag
        // shows up immediately during a demo.
        remoteConfig.settings = { minimumFetchIntervalMillis: 0, fetchTimeoutMillis: 60_000 };
    }

    return remoteConfig;
};

const publishValues = (config: RemoteConfigInstance): void => {
    cacheFeatureFlags(collectFlagValues((key) => getValue(config, key).asBoolean()));
};

export const initializeRemoteConfig = async (): Promise<void> => {
    const config = getInstance();

    try {
        await fetchAndActivate(config);
    } catch (error) {
        console.warn("Remote Config fetch failed, falling back to the stored config.", error);
    }

    // Publish either way: the native SDK keeps the last activated config on
    // disk, so a failed fetch still leaves real values to read rather than
    // dropping back to the defaults.
    publishValues(config);
};
