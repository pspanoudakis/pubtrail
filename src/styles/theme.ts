import { getFeatureFlag } from "@/featureFlags";
import * as defaultTheme from "./theme.default";
import * as altTheme from "./theme.alt";

const activeTheme = getFeatureFlag("newThemeTest") ? altTheme : defaultTheme;

if (__DEV__) {
    // TEMPORARY: diagnosing the flag rollout, remove once verified.
    console.log(`[theme] newThemeTest=${getFeatureFlag("newThemeTest")} -> ${activeTheme === altTheme ? "alt" : "default"}`);
}
// const activeTheme = defaultTheme;

export const COLORS = activeTheme.COLORS;
export const SPACING = activeTheme.SPACING;
export const TYPOGRAPHY = activeTheme.TYPOGRAPHY;
export const RADIUS = activeTheme.RADIUS;
