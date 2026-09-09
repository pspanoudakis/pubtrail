import {getRemoteConfigValue} from "@/firebaseConfig";
import * as defaultTheme from "./theme.default";
import * as altTheme from "./theme.alt";

const featureFlagValue = getRemoteConfigValue("newThemeTest") ?? false;
const activeTheme = featureFlagValue ? altTheme : defaultTheme;

export const COLORS = activeTheme.COLORS;
export const SPACING = activeTheme.SPACING;
export const TYPOGRAPHY = activeTheme.TYPOGRAPHY;
export const RADIUS = activeTheme.RADIUS;
