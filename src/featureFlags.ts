import { Platform } from "react-native";

// Values used until Remote Config answers, and whenever it cannot be reached.
export const FEATURE_FLAG_DEFAULTS = {
    newThemeTest: false,
    enableSoberTest: false,
};

export type FeatureFlagKey = keyof typeof FEATURE_FLAG_DEFAULTS;

const STORAGE_KEY = "pubtrail.featureFlags";

// Web-only fallback for when the Remote Config fetch fails or times out at
// startup: the last known values are kept here so the app opens on real flags
// rather than defaults. Native needs no equivalent - the native SDK persists
// its own activated config, which `getValue` returns even after a failed
// fetch. On both platforms the fetched values are what normally win.
const readCachedFlags = (): Partial<Record<FeatureFlagKey, boolean>> => {
    if (Platform.OS !== "web" || typeof localStorage === "undefined") {
        return {};
    }

    try {
        const cached = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<string, unknown>;
        const values: Partial<Record<FeatureFlagKey, boolean>> = {};

        (Object.keys(FEATURE_FLAG_DEFAULTS) as FeatureFlagKey[]).forEach((key) => {
            const value = cached[key];
            if (typeof value === "boolean") {
                values[key] = value;
            }
        });

        return values;
    } catch {
        return {};
    }
};

const flags: Record<FeatureFlagKey, boolean> = { ...FEATURE_FLAG_DEFAULTS, ...readCachedFlags() };

export const getFeatureFlag = (key: FeatureFlagKey): boolean => flags[key];

// Reads every declared flag through the caller's SDK, so the web and native
// Remote Config clients share one definition of "what a flag snapshot is".
export const collectFlagValues = (
    read: (key: FeatureFlagKey) => boolean,
): Record<FeatureFlagKey, boolean> => {
    const values = {} as Record<FeatureFlagKey, boolean>;

    (Object.keys(FEATURE_FLAG_DEFAULTS) as FeatureFlagKey[]).forEach((key) => {
        values[key] = read(key);
    });

    return values;
};

export const cacheFeatureFlags = (values: Record<FeatureFlagKey, boolean>): void => {
    // Applies on every platform; only the persistence below is web-specific.
    Object.assign(flags, values);

    if (Platform.OS !== "web" || typeof localStorage === "undefined") {
        return;
    }

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    } catch {
        // Storage unavailable (e.g. private mode): flags fall back to defaults.
    }
};
